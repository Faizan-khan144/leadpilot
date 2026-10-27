import { CallLog } from '../models/CallLog.js'
import { Lead } from '../models/Lead.js'
import { FollowUp } from '../models/FollowUp.js'
import { Membership } from '../models/Membership.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, paginatedResponse } from '../utils/query.js'
import { canAccessLead, isPrivileged } from '../utils/permissions.js'
import { logActivity } from '../services/activity.service.js'
import { createNotification } from '../services/notification.service.js'
import { recordAudit } from '../utils/audit.js'
import { AUDIT_ACTIONS } from '../config/constants.js'

const accessibleLead = async (req) => {
  const lead = await Lead.findOne({
    _id: req.body.lead,
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!lead) throw ApiError.notFound('Lead not found')
  if (!canAccessLead(req, lead)) throw ApiError.forbidden()
  return lead
}

export const createCall = asyncHandler(async (req, res) => {
  const lead = await accessibleLead(req)

  const call = await CallLog.create({
    ...req.body,
    organization: req.organizationId,
    user: req.user._id,
    createdBy: req.user._id,
  })

  lead.lastContactedAt = call.calledAt
  if (lead.status === 'New Lead') lead.status = 'Contacted'
  if (call.outcome === 'Interested') lead.status = 'Interested'
  if (call.outcome === 'Meeting Requested') lead.status = 'Meeting Scheduled'
  if (call.followUpAt) lead.nextFollowUpAt = call.followUpAt
  await lead.save()

  if (call.followUpAt) {
    await FollowUp.create({
      organization: req.organizationId,
      lead: lead._id,
      assignedTo: req.user._id,
      type: call.outcome === 'Meeting Requested' ? 'meeting' : 'follow_up',
      dueAt: call.followUpAt,
      meetingAt: call.outcome === 'Meeting Requested' ? call.followUpAt : null,
      priority: lead.priority,
      notes: call.nextAction || call.notes || '',
      createdBy: req.user._id,
    })
    await createNotification({
      organization: req.organizationId,
      user: req.user._id,
      type: call.outcome === 'Meeting Requested' ? 'meeting' : 'follow_up',
      title: call.outcome === 'Meeting Requested' ? 'Meeting scheduled' : 'Follow-up scheduled',
      message: `${lead.businessName} — ${call.nextAction || 'Next follow-up is due soon.'}`,
      link: `/leads/${lead._id}`,
    })
  }

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    type: 'call.logged',
    message: `Call logged with ${lead.businessName}: ${call.outcome}.`,
    metadata: {
      outcome: call.outcome,
      durationSeconds: call.durationSeconds,
      nextAction: call.nextAction,
    },
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.CALL_LOGGED,
    entityType: 'CallLog',
    entityId: call._id,
    after: call.toObject(),
  })

  res.status(201).json({
    call: await CallLog.findById(call._id).populate('user', 'name email'),
    lead,
  })
})

export const listCalls = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId }
  if (!isPrivileged(req.membership)) filter.user = req.user._id
  if (req.query.user && isPrivileged(req.membership)) filter.user = req.query.user
  if (req.query.lead) filter.lead = req.query.lead
  if (req.query.outcome) filter.outcome = req.query.outcome
  if (req.query.from || req.query.to) {
    filter.calledAt = {}
    if (req.query.from) filter.calledAt.$gte = req.query.from
    if (req.query.to) filter.calledAt.$lte = req.query.to
  }

  const [items, total] = await Promise.all([
    CallLog.find(filter)
      .populate('lead', 'businessName status phone')
      .populate('user', 'name email avatarColor')
      .sort('-calledAt')
      .skip(skip)
      .limit(limit),
    CallLog.countDocuments(filter),
  ])

  res.json(paginatedResponse({ items, total, page, limit }))
})

export const getCall = asyncHandler(async (req, res) => {
  const call = await CallLog.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
    .populate('lead', 'businessName status phone')
    .populate('user', 'name email')
  if (!call) throw ApiError.notFound('Call not found')
  if (!isPrivileged(req.membership) && String(call.user._id) !== String(req.user._id)) {
    throw ApiError.forbidden()
  }
  res.json({ call })
})

export const assignableMembers = asyncHandler(async (req, res) => {
  const filter = { organization: req.organizationId, status: 'active' }
  if (!isPrivileged(req.membership)) filter.user = req.user._id
  const memberships = await Membership.find(filter)
    .populate('user', 'name email avatarColor')
    .select('user role manager')
  res.json({ members: memberships })
})
