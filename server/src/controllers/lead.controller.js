import { Lead } from '../models/Lead.js'
import { Membership } from '../models/Membership.js'
import { Activity } from '../models/Activity.js'
import { CallLog } from '../models/CallLog.js'
import { FollowUp } from '../models/FollowUp.js'
import { Deal } from '../models/Deal.js'
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { escapeRegex, getPagination, getSort, paginatedResponse } from '../utils/query.js'
import { leadScope, isPrivileged, canAccessLead } from '../utils/permissions.js'
import { recordAudit } from '../utils/audit.js'
import { AUDIT_ACTIONS } from '../config/constants.js'
import { logActivity } from '../services/activity.service.js'
import { createNotification } from '../services/notification.service.js'
import { sendCsv, toCsv } from '../utils/csv.js'

const SORT_FIELDS = [
  'createdAt',
  'estimatedValuePaise',
  'businessName',
  'nextFollowUpAt',
]

const hydrateLead = (query) =>
  query
    .populate('assignedTo', 'name email avatarColor')
    .populate('createdBy', 'name email')

const buildLeadFilter = (req, { includePagination = true } = {}) => {
  const filter = {
    organization: req.organizationId,
    deletedAt: null,
    ...leadScope(req),
  }

  if (req.query.search) {
    const search = new RegExp(escapeRegex(req.query.search), 'i')
    filter.$or = [
      { businessName: search },
      { contactPerson: search },
      { email: search },
      { phone: search },
    ]
  }
  if (req.query.status) filter.status = req.query.status
  if (req.query.source) filter.source = req.query.source
  if (req.query.priority) filter.priority = req.query.priority
  if (req.query.assignedTo && isPrivileged(req.membership)) {
    filter.assignedTo = req.query.assignedTo
  }
  if (req.query.from || req.query.to) {
    filter.createdAt = {}
    if (req.query.from) filter.createdAt.$gte = req.query.from
    if (req.query.to) filter.createdAt.$lte = req.query.to
  }

  return filter
}

const assertAssignee = async (req, assignedTo) => {
  const target = String(assignedTo || req.user._id)
  if (req.membership.role === 'lead_generator' && target !== String(req.user._id)) {
    throw ApiError.forbidden('Lead generators can only assign leads to themselves.')
  }
  const membership = await Membership.findOne({
    user: target,
    organization: req.organizationId,
    status: 'active',
  })
  if (!membership) throw ApiError.badRequest('The selected assignee is not an active team member.')
  return target
}

export const listLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = buildLeadFilter(req)
  const sort = getSort(req.query, SORT_FIELDS)

  const [items, total] = await Promise.all([
    hydrateLead(Lead.find(filter)).sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ])

  res.json(paginatedResponse({ items, total, page, limit }))
})

export const getLead = asyncHandler(async (req, res) => {
  const lead = await hydrateLead(
    Lead.findOne({
      _id: req.params.id,
      organization: req.organizationId,
      deletedAt: null,
    }),
  )
  if (!lead) throw ApiError.notFound('Lead not found')
  if (!canAccessLead(req, lead)) throw ApiError.forbidden()

  const [activities, calls, followUps, deals] = await Promise.all([
    Activity.find({ organization: req.organizationId, lead: lead._id })
      .populate('actor', 'name email avatarColor')
      .sort('-createdAt')
      .limit(60),
    CallLog.find({ organization: req.organizationId, lead: lead._id })
      .populate('user', 'name email')
      .sort('-calledAt')
      .limit(50),
    FollowUp.find({ organization: req.organizationId, lead: lead._id })
      .populate('assignedTo', 'name email')
      .sort('-dueAt')
      .limit(50),
    Deal.find({ organization: req.organizationId, lead: lead._id })
      .populate('assignedTo', 'name email')
      .sort('-createdAt'),
  ])

  res.json({ lead, activities, calls, followUps, deals })
})

export const createLead = asyncHandler(async (req, res) => {
  const assignedTo = await assertAssignee(req, req.body.assignedTo)
  const lead = await Lead.create({
    ...req.body,
    assignedTo,
    organization: req.organizationId,
    createdBy: req.user._id,
  })

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    type: 'lead.created',
    message: `Lead ${lead.businessName} was created.`,
    metadata: { status: lead.status, assignedTo },
  })

  if (String(assignedTo) !== String(req.user._id)) {
    await createNotification({
      organization: req.organizationId,
      user: assignedTo,
      type: 'system',
      title: 'New lead assigned',
      message: `${lead.businessName} has been assigned to you.`,
      link: `/leads/${lead._id}`,
    })
  }

  if (req.body.nextFollowUpAt) {
    await FollowUp.create({
      organization: req.organizationId,
      lead: lead._id,
      assignedTo,
      type: 'follow_up',
      dueAt: req.body.nextFollowUpAt,
      priority: lead.priority,
      notes: 'Follow up on the new lead.',
      createdBy: req.user._id,
    })
  }

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.LEAD_CREATED,
    entityType: 'Lead',
    entityId: lead._id,
    after: lead.toObject(),
  })

  res.status(201).json({ lead: await hydrateLead(Lead.findById(lead._id)) })
})

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!lead) throw ApiError.notFound('Lead not found')
  if (!canAccessLead(req, lead)) throw ApiError.forbidden()

  const before = lead.toObject()
  const updates = { ...req.body }
  delete updates.organization
  delete updates.createdBy

  if (updates.assignedTo !== undefined) {
    updates.assignedTo = await assertAssignee(req, updates.assignedTo)
    if (String(updates.assignedTo) !== String(lead.assignedTo) && !isPrivileged(req.membership)) {
      throw ApiError.forbidden('Only managers and owners can reassign leads.')
    }
  }
  if (updates.status === 'Lost' && !String(updates.lostReason || lead.lostReason || '').trim()) {
    throw ApiError.badRequest('A lost reason is required when marking a lead as lost.')
  }

  Object.assign(lead, updates)
  await lead.save()

  if (updates.assignedTo && String(before.assignedTo) !== String(lead.assignedTo)) {
    await createNotification({
      organization: req.organizationId,
      user: lead.assignedTo,
      type: 'system',
      title: 'Lead assigned',
      message: `${lead.businessName} has been assigned to you.`,
      link: `/leads/${lead._id}`,
    })
    await logActivity({
      organization: req.organizationId,
      actor: req.user._id,
      lead: lead._id,
      type: 'lead.assigned',
      message: `${lead.businessName} was reassigned.`,
      metadata: { from: before.assignedTo, to: lead.assignedTo },
    })
  }

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    type: 'lead.updated',
    message: `${lead.businessName} was updated.`,
    metadata: { fields: Object.keys(updates) },
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.LEAD_UPDATED,
    entityType: 'Lead',
    entityId: lead._id,
    before,
    after: lead.toObject(),
  })

  res.json({ lead: await hydrateLead(Lead.findById(lead._id)) })
})

export const deleteLead = asyncHandler(async (req, res) => {
  if (!isPrivileged(req.membership)) throw ApiError.forbidden()
  const lead = await Lead.findOne({
    _id: req.params.id,
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!lead) throw ApiError.notFound('Lead not found')

  lead.deletedAt = new Date()
  await lead.save()

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    type: 'lead.deleted',
    message: `${lead.businessName} was deleted.`,
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.LEAD_DELETED,
    entityType: 'Lead',
    entityId: lead._id,
    before: lead.toObject(),
  })

  res.json({ message: 'Lead deleted.' })
})

export const updateLeadStage = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!lead) throw ApiError.notFound('Lead not found')
  if (!canAccessLead(req, lead)) throw ApiError.forbidden()

  const previous = lead.status
  lead.status = req.body.status
  lead.lostReason = req.body.status === 'Lost' ? req.body.lostReason : ''
  await lead.save()

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    type: 'lead.stage_changed',
    message: `${lead.businessName} moved from ${previous} to ${lead.status}.`,
    metadata: {
      from: previous,
      to: lead.status,
      lostReason: lead.lostReason,
      changedBy: req.user._id,
      changedAt: new Date(),
    },
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.LEAD_STAGE_CHANGED,
    entityType: 'Lead',
    entityId: lead._id,
    before: { status: previous },
    after: { status: lead.status, lostReason: lead.lostReason },
  })

  res.json({ lead: await hydrateLead(Lead.findById(lead._id)) })
})

export const bulkAssignLeads = asyncHandler(async (req, res) => {
  if (!isPrivileged(req.membership)) throw ApiError.forbidden()
  const assignedTo = await assertAssignee(req, req.body.assignedTo)

  const leads = await Lead.find({
    _id: { $in: req.body.leadIds },
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!leads.length) throw ApiError.notFound('No matching leads found')

  await Lead.updateMany(
    { _id: { $in: leads.map((lead) => lead._id) } },
    { $set: { assignedTo } },
  )

  const activities = leads.map((lead) => ({
    organization: req.organizationId,
    lead: lead._id,
    actor: req.user._id,
    type: 'lead.assigned',
    message: `${lead.businessName} was bulk assigned.`,
    metadata: { from: lead.assignedTo, to: assignedTo },
  }))
  await Activity.insertMany(activities)

  await createNotification({
    organization: req.organizationId,
    user: assignedTo,
    type: 'system',
    title: `${leads.length} leads assigned`,
    message: 'New leads are ready for you in the pipeline.',
    link: '/leads',
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.LEAD_ASSIGNED,
    entityType: 'Lead',
    after: { leadIds: leads.map((lead) => lead._id), assignedTo },
  })

  res.json({ message: `${leads.length} leads assigned.`, count: leads.length })
})

export const exportLeads = asyncHandler(async (req, res) => {
  const filter = buildLeadFilter(req)
  const leads = await hydrateLead(Lead.find(filter)).sort('-createdAt').limit(5000)

  const csv = toCsv(leads, [
    { label: 'Business', value: (lead) => lead.businessName },
    { label: 'Contact', value: (lead) => lead.contactPerson },
    { label: 'Phone', value: (lead) => lead.phone },
    { label: 'Email', value: (lead) => lead.email },
    { label: 'Website', value: (lead) => lead.website },
    { label: 'Industry', value: (lead) => lead.industry },
    { label: 'City', value: (lead) => lead.city },
    { label: 'Country', value: (lead) => lead.country },
    { label: 'Source', value: (lead) => lead.source },
    { label: 'Assigned To', value: (lead) => lead.assignedTo?.email || '' },
    { label: 'Estimated Value (INR)', value: (lead) => (lead.estimatedValuePaise / 100).toFixed(2) },
    { label: 'Status', value: (lead) => lead.status },
    { label: 'Priority', value: (lead) => lead.priority },
    { label: 'Next Follow-up', value: (lead) => lead.nextFollowUpAt?.toISOString() || '' },
    { label: 'Created', value: (lead) => lead.createdAt.toISOString() },
  ])

  sendCsv(res, `leadpilot-leads-${Date.now()}.csv`, csv)
})

export const importLeads = asyncHandler(async (req, res) => {
  const { rows, skipDuplicates } = req.body
  const results = { imported: 0, skipped: 0, errors: [] }

  const emails = rows.map((row) => row.email).filter(Boolean)
  const phones = rows.map((row) => row.phone).filter(Boolean)
  const existingConditions = []
  if (emails.length) existingConditions.push({ email: { $in: emails } })
  if (phones.length) existingConditions.push({ phone: { $in: phones } })
  const existing = existingConditions.length
    ? await Lead.find({
        organization: req.organizationId,
        deletedAt: null,
        $or: existingConditions,
      }).select('email phone')
    : []
  const existingEmails = new Set(existing.map((lead) => lead.email).filter(Boolean))
  const existingPhones = new Set(existing.map((lead) => lead.phone).filter(Boolean))

  const assigneeEmails = [...new Set(rows.map((row) => row.assignedToEmail).filter(Boolean))]
  const assigneeUsers = assigneeEmails.length
    ? await User.find({ email: { $in: assigneeEmails } }).select('_id email')
    : []
  const assigneeMap = new Map(assigneeUsers.map((user) => [user.email, user._id]))
  const activeMemberships = assigneeUsers.length
    ? await Membership.find({
        organization: req.organizationId,
        user: { $in: assigneeUsers.map((user) => user._id) },
        status: 'active',
      }).select('user')
    : []
  const activeUserIds = new Set(activeMemberships.map((item) => String(item.user)))

  const toCreate = []
  rows.forEach((row, index) => {
    const duplicate =
      (row.email && existingEmails.has(row.email)) ||
      (row.phone && existingPhones.has(row.phone))
    if (duplicate) {
      if (skipDuplicates) {
        results.skipped += 1
        return
      }
      results.errors.push({ row: index + 1, message: 'Duplicate lead' })
      return
    }

    let assignedTo = req.user._id
    if (row.assignedToEmail) {
      const userId = assigneeMap.get(row.assignedToEmail)
      if (!userId || !activeUserIds.has(String(userId))) {
        results.errors.push({
          row: index + 1,
          message: `Assignee ${row.assignedToEmail} is not an active team member`,
        })
        return
      }
      assignedTo = userId
    }

    toCreate.push({
      organization: req.organizationId,
      businessName: row.businessName,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email,
      website: row.website,
      industry: row.industry,
      city: row.city,
      country: row.country,
      source: row.source,
      assignedTo,
      estimatedValuePaise: row.estimatedValuePaise,
      status: row.status,
      priority: row.priority,
      notes: row.notes,
      createdBy: req.user._id,
    })

    if (row.email) existingEmails.add(row.email)
    if (row.phone) existingPhones.add(row.phone)
  })

  if (toCreate.length) {
    const created = await Lead.insertMany(toCreate)
    results.imported = created.length
    await Activity.insertMany(
      created.map((lead) => ({
        organization: req.organizationId,
        lead: lead._id,
        actor: req.user._id,
        type: 'lead.imported',
        message: `${lead.businessName} was imported from CSV.`,
      })),
    )
  }

  await recordAudit({
    req,
    organization: req.organizationId,
    action: 'lead.imported',
    entityType: 'Lead',
    after: results,
  })

  res.status(201).json(results)
})
