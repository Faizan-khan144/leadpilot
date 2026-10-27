import { FollowUp } from '../models/FollowUp.js'
import { Lead } from '../models/Lead.js'
import { Membership } from '../models/Membership.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, paginatedResponse } from '../utils/query.js'
import { canAccessLead, isPrivileged } from '../utils/permissions.js'
import { startOfDayInTimeZone, endOfDayInTimeZone } from '../utils/timezone.js'
import { createNotification } from '../services/notification.service.js'
import { logActivity } from '../services/activity.service.js'
import { recordAudit } from '../utils/audit.js'
import { AUDIT_ACTIONS } from '../config/constants.js'

const loadFollowUp = async (req) => {
  const followUp = await FollowUp.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!followUp) throw ApiError.notFound('Follow-up not found')
  if (
    !isPrivileged(req.membership) &&
    String(followUp.assignedTo) !== String(req.user._id)
  ) {
    throw ApiError.forbidden()
  }
  return followUp
}

export const createFollowUp = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.body.lead,
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!lead) throw ApiError.notFound('Lead not found')
  if (!canAccessLead(req, lead)) throw ApiError.forbidden()

  let assignedTo = req.body.assignedTo
  if (!isPrivileged(req.membership)) assignedTo = req.user._id
  const membership = await Membership.findOne({
    organization: req.organizationId,
    user: assignedTo,
    status: 'active',
  })
  if (!membership) throw ApiError.badRequest('The selected assignee is not an active member.')

  const followUp = await FollowUp.create({
    ...req.body,
    assignedTo,
    organization: req.organizationId,
    createdBy: req.user._id,
  })

  lead.nextFollowUpAt = followUp.dueAt
  await lead.save()

  await createNotification({
    organization: req.organizationId,
    user: assignedTo,
    type: followUp.type === 'meeting' ? 'meeting' : 'follow_up',
    title: followUp.type === 'meeting' ? 'Meeting scheduled' : 'Follow-up scheduled',
    message: `${lead.businessName} on ${followUp.dueAt.toLocaleString('en-IN')}`,
    link: `/follow-ups`,
    dedupeKey: `follow-up-created-${followUp._id}`,
  })

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    type: 'follow_up.created',
    message: `${followUp.type === 'meeting' ? 'Meeting' : 'Follow-up'} scheduled for ${lead.businessName}.`,
    metadata: { dueAt: followUp.dueAt, assignedTo },
  })

  res.status(201).json({ followUp, lead })
})

export const listFollowUps = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId }
  if (!isPrivileged(req.membership)) filter.assignedTo = req.user._id
  if (req.query.assignedTo && isPrivileged(req.membership)) {
    filter.assignedTo = req.query.assignedTo
  }
  if (req.query.lead) filter.lead = req.query.lead
  if (req.query.type) filter.type = req.query.type
  if (req.query.priority) filter.priority = req.query.priority

  const now = new Date()
  const timeZone = req.organization.timezone || 'Asia/Kolkata'
  const dayStart = startOfDayInTimeZone(now, timeZone)
  const dayEnd = endOfDayInTimeZone(now, timeZone)
  const view = req.query.view || 'all'

  if (view === 'today') {
    filter.status = 'pending'
    filter.dueAt = { $gte: dayStart, $lte: dayEnd }
  } else if (view === 'overdue') {
    filter.status = 'pending'
    filter.dueAt = { $lt: dayStart }
  } else if (view === 'upcoming') {
    filter.status = 'pending'
    filter.dueAt = { $gt: dayEnd }
  } else if (view === 'completed') {
    filter.status = 'completed'
  }

  if (req.query.from || req.query.to) {
    filter.dueAt = { ...(filter.dueAt || {}) }
    if (req.query.from) filter.dueAt.$gte = req.query.from
    if (req.query.to) filter.dueAt.$lte = req.query.to
  }

  const [items, total] = await Promise.all([
    FollowUp.find(filter)
      .populate('lead', 'businessName status phone priority estimatedValuePaise')
      .populate('assignedTo', 'name email avatarColor')
      .sort('dueAt')
      .skip(skip)
      .limit(limit),
    FollowUp.countDocuments(filter),
  ])

  res.json(paginatedResponse({ items, total, page, limit }))
})

export const completeFollowUp = asyncHandler(async (req, res) => {
  const followUp = await loadFollowUp(req)
  if (followUp.status !== 'pending') {
    throw ApiError.badRequest('Only pending follow-ups can be completed.')
  }

  followUp.status = 'completed'
  followUp.completedAt = new Date()
  followUp.completedBy = req.user._id
  if (req.body.meetingNotes) followUp.meetingNotes = req.body.meetingNotes
  await followUp.save()

  const next = await FollowUp.findOne({
    organization: req.organizationId,
    lead: followUp.lead,
    status: 'pending',
    _id: { $ne: followUp._id },
  }).sort('dueAt')

  await Lead.updateOne(
    { _id: followUp.lead, organization: req.organizationId },
    { $set: { nextFollowUpAt: next?.dueAt || null } },
  )

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: followUp.lead,
    type: 'follow_up.completed',
    message: `${followUp.type === 'meeting' ? 'Meeting' : 'Follow-up'} marked complete.`,
    metadata: { followUpId: followUp._id },
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.FOLLOW_UP_COMPLETED,
    entityType: 'FollowUp',
    entityId: followUp._id,
  })

  res.json({ followUp, message: 'Follow-up completed.' })
})

export const rescheduleFollowUp = asyncHandler(async (req, res) => {
  const followUp = await loadFollowUp(req)
  const previous = followUp.dueAt
  followUp.dueAt = req.body.dueAt
  followUp.rescheduledFrom = previous
  if (followUp.type === 'meeting') followUp.meetingAt = req.body.dueAt
  followUp.status = 'pending'
  await followUp.save()

  await Lead.updateOne(
    { _id: followUp.lead, organization: req.organizationId },
    { $set: { nextFollowUpAt: followUp.dueAt } },
  )

  await createNotification({
    organization: req.organizationId,
    user: followUp.assignedTo,
    type: followUp.type === 'meeting' ? 'meeting' : 'follow_up',
    title: 'Follow-up rescheduled',
    message: `Moved from ${previous.toLocaleString('en-IN')} to ${followUp.dueAt.toLocaleString('en-IN')}.`,
    link: '/follow-ups',
    dedupeKey: `follow-up-rescheduled-${followUp._id}-${followUp.dueAt.toISOString()}`,
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.FOLLOW_UP_RESCHEDULED,
    entityType: 'FollowUp',
    entityId: followUp._id,
    before: { dueAt: previous },
    after: { dueAt: followUp.dueAt, reason: req.body.reason || '' },
  })

  res.json({ followUp, message: 'Follow-up rescheduled.' })
})

export const followUpSummary = asyncHandler(async (req, res) => {
  const base = { organization: req.organizationId, status: 'pending' }
  if (!isPrivileged(req.membership)) base.assignedTo = req.user._id

  const now = new Date()
  const dayStart = startOfDayInTimeZone(now, req.organization.timezone || 'Asia/Kolkata')
  const dayEnd = endOfDayInTimeZone(now, req.organization.timezone || 'Asia/Kolkata')

  const [today, overdue, upcoming] = await Promise.all([
    FollowUp.countDocuments({ ...base, dueAt: { $gte: dayStart, $lte: dayEnd } }),
    FollowUp.countDocuments({ ...base, dueAt: { $lt: dayStart } }),
    FollowUp.countDocuments({ ...base, dueAt: { $gt: dayEnd } }),
  ])

  res.json({ today, overdue, upcoming })
})
