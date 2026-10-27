import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'
import { Lead } from '../models/Lead.js'
import { CallLog } from '../models/CallLog.js'
import { Deal } from '../models/Deal.js'
import { Commission } from '../models/Commission.js'
import { FollowUp } from '../models/FollowUp.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, paginatedResponse } from '../utils/query.js'
import { buildClientUrl, sendEmail } from '../utils/email.js'
import { createRandomToken, hashToken } from '../utils/tokens.js'
import { escapeRegex } from '../utils/query.js'
import { env } from '../config/env.js'
import { AUDIT_ACTIONS } from '../config/constants.js'
import { recordAudit } from '../utils/audit.js'
import { createNotification } from '../services/notification.service.js'

const performanceMap = (rows, key = '_id') =>
  new Map(rows.map((row) => [String(row[key]), row]))

const buildPerformance = async (organizationId, userIds) => {
  if (!userIds.length) return new Map()

  const [leads, calls, deals, commissions, meetings] = await Promise.all([
    Lead.aggregate([
      { $match: { organization: organizationId, assignedTo: { $in: userIds }, deletedAt: null } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
    CallLog.aggregate([
      { $match: { organization: organizationId, user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          calls: { $sum: 1 },
          answered: {
            $sum: {
              $cond: [
                { $in: ['$outcome', ['Busy', 'Not Interested', 'Interested', 'Call Back Later', 'Meeting Requested', 'Wrong Number']] },
                1,
                0,
              ],
            },
          },
          interested: {
            $sum: { $cond: [{ $in: ['$outcome', ['Interested', 'Meeting Requested']] }, 1, 0] },
          },
          meetingsBooked: {
            $sum: { $cond: [{ $eq: ['$outcome', 'Meeting Requested'] }, 1, 0] },
          },
        },
      },
    ]),
    Deal.aggregate([
      { $match: { organization: organizationId, assignedTo: { $in: userIds }, status: 'won' } },
      {
        $group: {
          _id: '$assignedTo',
          dealsWon: { $sum: 1 },
          revenuePaise: { $sum: '$amountPaise' },
        },
      },
    ]),
    Commission.aggregate([
      { $match: { organization: organizationId, member: { $in: userIds } } },
      {
        $group: {
          _id: '$member',
          calculatedCommissionPaise: { $sum: '$calculatedCommissionPaise' },
          earnedCommissionPaise: { $sum: '$earnedCommissionPaise' },
          approvedCommissionPaise: { $sum: '$approvedCommissionPaise' },
          paidCommissionPaise: { $sum: '$paidCommissionPaise' },
        },
      },
    ]),
    FollowUp.aggregate([
      {
        $match: {
          organization: organizationId,
          assignedTo: { $in: userIds },
          type: 'meeting',
          status: 'completed',
        },
      },
      { $group: { _id: '$assignedTo', meetingsCompleted: { $sum: 1 } } },
    ]),
  ])

  const leadMap = performanceMap(leads)
  const callMap = performanceMap(calls)
  const dealMap = performanceMap(deals)
  const commissionMap = performanceMap(commissions)
  const meetingMap = performanceMap(meetings)

  return new Map(
    userIds.map((id) => {
      const key = String(id)
      return [
        key,
        {
          leads: leadMap.get(key)?.count || 0,
          calls: callMap.get(key)?.calls || 0,
          answeredCalls: callMap.get(key)?.answered || 0,
          interestedProspects: callMap.get(key)?.interested || 0,
          meetingsBooked:
            (callMap.get(key)?.meetingsBooked || 0) +
            (meetingMap.get(key)?.meetingsCompleted || 0),
          dealsWon: dealMap.get(key)?.dealsWon || 0,
          revenuePaise: dealMap.get(key)?.revenuePaise || 0,
          calculatedCommissionPaise:
            commissionMap.get(key)?.calculatedCommissionPaise || 0,
          earnedCommissionPaise: commissionMap.get(key)?.earnedCommissionPaise || 0,
          approvedCommissionPaise:
            commissionMap.get(key)?.approvedCommissionPaise || 0,
          paidCommissionPaise: commissionMap.get(key)?.paidCommissionPaise || 0,
        },
      ]
    }),
  )
}

export const listMembers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId }

  if (req.query.role) filter.role = req.query.role
  if (req.query.status) filter.status = req.query.status
  if (req.membership.role === 'manager') {
    filter.$or = [{ user: req.user._id }, { manager: req.user._id }]
  }
  if (req.query.search) {
    const search = new RegExp(escapeRegex(req.query.search), 'i')
    const users = await User.find({
      $or: [{ name: search }, { email: search }],
    }).select('_id')
    filter.$and = [
      {
        $or: [
          { user: { $in: users.map((user) => user._id) } },
          { invitedEmail: search },
        ],
      },
    ]
  }

  const [memberships, total] = await Promise.all([
    Membership.find(filter)
      .populate('user', 'name email avatarColor lastLoginAt')
      .populate('manager', 'name email')
      .sort({ role: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Membership.countDocuments(filter),
  ])

  const userIds = memberships.map((membership) => membership.user?._id).filter(Boolean)
  const performance = await buildPerformance(req.organizationId, userIds)

  const items = memberships.map((membership) => ({
    ...membership.toJSON(),
    performance: membership.user
      ? performance.get(String(membership.user._id))
      : {
          leads: 0,
          calls: 0,
          answeredCalls: 0,
          interestedProspects: 0,
          meetingsBooked: 0,
          dealsWon: 0,
          revenuePaise: 0,
          calculatedCommissionPaise: 0,
          earnedCommissionPaise: 0,
          approvedCommissionPaise: 0,
          paidCommissionPaise: 0,
        },
  }))

  res.json(paginatedResponse({ items, total, page, limit }))
})

export const inviteMember = asyncHandler(async (req, res) => {
  const { email, role, managerId, name } = req.body

  if (role === 'owner') throw ApiError.badRequest('Ownership cannot be transferred by invitation.')

  const duplicate = await Membership.findOne({
    organization: req.organizationId,
    $or: [
      { invitedEmail: email },
      { user: { $in: await User.find({ email }).distinct('_id') } },
    ],
  })
  if (duplicate) {
    throw ApiError.conflict('This person is already a member or has a pending invitation.')
  }

  let manager = null
  if (managerId) {
    manager = await Membership.findOne({
      organization: req.organizationId,
      user: managerId,
      status: 'active',
    })
    if (!manager) throw ApiError.badRequest('The selected manager is not an active member.')
  }

  const existingUser = await User.findOne({ email })
  const token = createRandomToken()
  const membership = await Membership.create({
    organization: req.organizationId,
    user: existingUser?._id || null,
    invitedEmail: email,
    invitedName: name || existingUser?.name || '',
    role,
    status: 'pending',
    manager: manager?.user || null,
    invitedBy: req.user._id,
    inviteTokenHash: hashToken(token),
    inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  const inviteUrl = buildClientUrl(`/accept-invite?token=${token}`)
  await sendEmail({
    to: email,
    subject: `You have been invited to ${req.organization.name} on LeadPilot`,
    text: `Accept your invitation within 7 days: ${inviteUrl}`,
    html: `<p>You have been invited to join <strong>${req.organization.name}</strong> as a ${role.replace('_', ' ')}.</p><p><a href="${inviteUrl}">Accept invitation</a></p><p>This link expires in 7 days.</p>`,
  })

  if (existingUser) {
    await createNotification({
      organization: req.organizationId,
      user: existingUser._id,
      type: 'invitation',
      title: `Invitation to ${req.organization.name}`,
      message: 'You have been invited to join the team.',
      link: `/accept-invite?token=${token}`,
      dedupeKey: `invitation-${membership._id}`,
    })
  }

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.MEMBER_INVITED,
    entityType: 'Membership',
    entityId: membership._id,
    after: { email, role },
  })

  res.status(201).json({
    membership,
    message: 'Invitation created.',
    ...(env.nodeEnv === 'production' ? {} : { inviteUrl, devInviteToken: token }),
  })
})

export const updateMember = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!membership) throw ApiError.notFound('Team member not found')
  if (membership.role === 'owner') {
    throw ApiError.forbidden('The organization owner cannot be modified.')
  }

  const before = membership.toObject()

  if (req.body.role) membership.role = req.body.role
  if (req.body.status) {
    membership.status = req.body.status
    membership.deactivatedAt = req.body.status === 'inactive' ? new Date() : null
  }
  if (req.body.managerId !== undefined) {
    if (req.body.managerId) {
      const manager = await Membership.findOne({
        organization: req.organizationId,
        user: req.body.managerId,
        status: 'active',
        role: { $in: ['owner', 'manager'] },
      })
      if (!manager) throw ApiError.badRequest('The selected manager is not active.')
      membership.manager = manager.user
    } else {
      membership.manager = null
    }
  }

  if (membership.role === 'lead_generator' && !membership.manager) {
    throw ApiError.badRequest('Lead generators must be assigned to a manager.')
  }

  await membership.save()

  await recordAudit({
    req,
    organization: req.organizationId,
    action:
      req.body.status === 'inactive'
        ? AUDIT_ACTIONS.MEMBER_DEACTIVATED
        : AUDIT_ACTIONS.MEMBER_UPDATED,
    entityType: 'Membership',
    entityId: membership._id,
    before,
    after: membership.toObject(),
  })

  res.json({ membership, message: 'Team member updated.' })
})

export const deactivateMember = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!membership) throw ApiError.notFound('Team member not found')
  if (membership.role === 'owner') {
    throw ApiError.forbidden('The organization owner cannot be deactivated.')
  }

  const before = membership.toObject()
  membership.status = 'inactive'
  membership.deactivatedAt = new Date()
  await membership.save()

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.MEMBER_DEACTIVATED,
    entityType: 'Membership',
    entityId: membership._id,
    before,
    after: membership.toObject(),
  })

  res.json({ membership, message: 'Team member deactivated.' })
})
