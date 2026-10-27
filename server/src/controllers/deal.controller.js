import { Deal } from '../models/Deal.js'
import { Lead } from '../models/Lead.js'
import { Payment } from '../models/Payment.js'
import { Commission } from '../models/Commission.js'
import { Membership } from '../models/Membership.js'
import { Activity } from '../models/Activity.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, paginatedResponse } from '../utils/query.js'
import { canAccessLead, isPrivileged } from '../utils/permissions.js'
import { recordAudit } from '../utils/audit.js'
import { AUDIT_ACTIONS } from '../config/constants.js'
import { logActivity } from '../services/activity.service.js'
import { createNotification } from '../services/notification.service.js'
import {
  createCommissionForDeal,
  createCommissionSnapshot,
  recalculateCommission,
} from '../services/commission.service.js'
import { percentageOf } from '../utils/money.js'

const canAccessDeal = (req, deal) =>
  isPrivileged(req.membership) || String(deal.assignedTo) === String(req.user._id)

const assertAssignee = async (req, assignedTo) => {
  const target = String(assignedTo || req.user._id)
  if (req.membership.role === 'lead_generator' && target !== String(req.user._id)) {
    throw ApiError.forbidden('Lead generators can only assign deals to themselves.')
  }
  const membership = await Membership.findOne({
    user: target,
    organization: req.organizationId,
    status: 'active',
  })
  if (!membership) throw ApiError.badRequest('The selected assignee is not an active team member.')
  return target
}

const attachFinancials = async (dealDocuments) => {
  const deals = dealDocuments.map((deal) =>
    typeof deal.toObject === 'function' ? deal.toObject() : deal,
  )
  if (!deals.length) return deals

  const dealIds = deals.map((deal) => deal._id)
  const [payments, commissions] = await Promise.all([
    Payment.aggregate([
      { $match: { deal: { $in: dealIds } } },
      { $group: { _id: '$deal', total: { $sum: '$amountPaise' } } },
    ]),
    Commission.find({ deal: { $in: dealIds } }),
  ])
  const paymentMap = new Map(payments.map((entry) => [String(entry._id), entry.total]))
  const commissionMap = new Map(
    commissions.map((entry) => [String(entry.deal), entry.toJSON()]),
  )

  return deals.map((deal) => {
    const receivedPaise = paymentMap.get(String(deal._id)) || 0
    return {
      ...deal,
      receivedPaise,
      outstandingPaise: Math.max(0, deal.amountPaise - receivedPaise),
      commission: commissionMap.get(String(deal._id)) || null,
    }
  })
}

export const listDeals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId }
  if (!isPrivileged(req.membership)) filter.assignedTo = req.user._id
  if (req.query.status) filter.status = req.query.status
  if (req.query.assignedTo && isPrivileged(req.membership)) {
    filter.assignedTo = req.query.assignedTo
  }
  if (req.query.lead) filter.lead = req.query.lead
  if (req.query.search) {
    filter.businessName = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  }
  if (req.query.from || req.query.to) {
    filter.createdAt = {}
    if (req.query.from) filter.createdAt.$gte = req.query.from
    if (req.query.to) filter.createdAt.$lte = req.query.to
  }

  const [docs, total] = await Promise.all([
    Deal.find(filter)
      .populate('lead', 'businessName status priority')
      .populate('assignedTo', 'name email avatarColor')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Deal.countDocuments(filter),
  ])

  res.json(paginatedResponse({ items: await attachFinancials(docs), total, page, limit }))
})

export const getDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
    .populate('lead', 'businessName contactPerson phone email status priority')
    .populate('assignedTo', 'name email avatarColor')
    .populate('createdBy', 'name email')

  if (!deal) throw ApiError.notFound('Deal not found')
  if (!canAccessDeal(req, deal)) throw ApiError.forbidden()

  const [financials, payments, activities] = await Promise.all([
    attachFinancials([deal]),
    Payment.find({ organization: req.organizationId, deal: deal._id })
      .populate('recordedBy', 'name email')
      .sort('-receivedAt'),
    Activity.find({ organization: req.organizationId, deal: deal._id })
      .populate('actor', 'name email')
      .sort('-createdAt')
      .limit(50),
  ])

  res.json({ deal: financials[0], payments, activities })
})

export const createDeal = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.body.lead,
    organization: req.organizationId,
    deletedAt: null,
  })
  if (!lead) throw ApiError.notFound('Lead not found')
  if (!canAccessLead(req, lead)) throw ApiError.forbidden()

  const assignedTo = await assertAssignee(
    req,
    req.body.assignedTo || lead.assignedTo || req.user._id,
  )
  const commissionSnapshot = createCommissionSnapshot({
    amountPaise: req.body.amountPaise,
    organization: req.organization,
  })

  const deal = await Deal.create({
    organization: req.organizationId,
    lead: lead._id,
    businessName: lead.businessName,
    contactPerson: lead.contactPerson,
    amountPaise: req.body.amountPaise,
    assignedTo,
    proposalDate: req.body.proposalDate,
    expectedClosingDate: req.body.expectedClosingDate,
    notes: req.body.notes,
    commissionSnapshot,
    createdBy: req.user._id,
  })

  await createCommissionForDeal(deal)

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: lead._id,
    deal: deal._id,
    type: 'deal.created',
    message: `Deal created for ${lead.businessName}.`,
    metadata: { amountPaise: deal.amountPaise, assignedTo },
  })

  if (String(assignedTo) !== String(req.user._id)) {
    await createNotification({
      organization: req.organizationId,
      user: assignedTo,
      type: 'deal',
      title: 'New deal assigned',
      message: `${lead.businessName} — deal value recorded.`,
      link: `/deals/${deal._id}`,
    })
  }

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.DEAL_CREATED,
    entityType: 'Deal',
    entityId: deal._id,
    after: deal.toObject(),
  })

  res.status(201).json({ deal: (await attachFinancials([deal]))[0] })
})

export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!deal) throw ApiError.notFound('Deal not found')
  if (!canAccessDeal(req, deal)) throw ApiError.forbidden()

  const before = deal.toObject()
  const updates = { ...req.body }

  if (updates.assignedTo && !isPrivileged(req.membership)) {
    throw ApiError.forbidden('Only managers and owners can reassign deals.')
  }
  if (updates.assignedTo) {
    updates.assignedTo = await assertAssignee(req, updates.assignedTo)
  }

  if (updates.amountPaise && updates.amountPaise !== deal.amountPaise) {
    if (deal.status === 'lost') {
      throw ApiError.badRequest('A lost deal cannot be repriced.')
    }
    const paid = await Payment.aggregate([
      { $match: { organization: req.organizationId, deal: deal._id } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ])
    const received = paid[0]?.total || 0
    if (updates.amountPaise < received) {
      throw ApiError.badRequest('Deal value cannot be lower than payments already received.')
    }
    deal.commissionSnapshot.calculatedCommissionPaise = percentageOf(
      updates.amountPaise,
      deal.commissionSnapshot.ratePercent,
    )
  }

  Object.assign(deal, updates)
  await deal.save()

  if (updates.amountPaise || updates.assignedTo) {
    const commission = await Commission.findOne({ deal: deal._id })
    if (commission) {
      commission.dealAmountPaise = deal.amountPaise
      commission.calculatedCommissionPaise =
        deal.commissionSnapshot.calculatedCommissionPaise
      if (updates.assignedTo) commission.member = deal.assignedTo
      await commission.save()
      await recalculateCommission(commission._id)
    }
  }

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: deal.lead,
    deal: deal._id,
    type: 'deal.updated',
    message: `Deal for ${deal.businessName} was updated.`,
    metadata: { fields: Object.keys(updates) },
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.DEAL_UPDATED,
    entityType: 'Deal',
    entityId: deal._id,
    before,
    after: deal.toObject(),
  })

  res.json({ deal: (await attachFinancials([deal]))[0] })
})

export const updateDealStatus = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!deal) throw ApiError.notFound('Deal not found')
  if (!canAccessDeal(req, deal)) throw ApiError.forbidden()

  const before = deal.toObject()
  deal.status = req.body.status
  deal.actualClosingDate =
    req.body.status === 'won' || req.body.status === 'lost'
      ? req.body.actualClosingDate || new Date()
      : null
  deal.lostReason = req.body.status === 'lost' ? req.body.lostReason : ''
  await deal.save()

  if (req.body.status === 'won' || req.body.status === 'lost') {
    await Lead.updateOne(
      { _id: deal.lead, organization: req.organizationId },
      { $set: { status: req.body.status === 'won' ? 'Won' : 'Lost' } },
    )
  }

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: deal.lead,
    deal: deal._id,
    type: req.body.status === 'won' ? 'deal.won' : 'deal.lost',
    message: `Deal for ${deal.businessName} marked ${req.body.status}.`,
    metadata: { lostReason: deal.lostReason },
  })

  await createNotification({
    organization: req.organizationId,
    user: deal.assignedTo,
    type: 'deal',
    title: req.body.status === 'won' ? 'Deal won' : 'Deal marked lost',
    message: `${deal.businessName} — ${deal.status}.`,
    link: `/deals/${deal._id}`,
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: req.body.status === 'won' ? AUDIT_ACTIONS.DEAL_WON : AUDIT_ACTIONS.DEAL_LOST,
    entityType: 'Deal',
    entityId: deal._id,
    before: { status: before.status },
    after: { status: deal.status, lostReason: deal.lostReason },
  })

  res.json({ deal: (await attachFinancials([deal]))[0] })
})

export const createPayment = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({
    _id: req.body.deal,
    organization: req.organizationId,
  })
  if (!deal) throw ApiError.notFound('Deal not found')
  if (!canAccessDeal(req, deal)) throw ApiError.forbidden()
  if (deal.status === 'lost') throw ApiError.badRequest('Payments cannot be recorded for a lost deal.')

  const total = await Payment.aggregate([
    { $match: { organization: req.organizationId, deal: deal._id } },
    { $group: { _id: null, total: { $sum: '$amountPaise' } } },
  ])
  const received = total[0]?.total || 0
  if (received + req.body.amountPaise > deal.amountPaise) {
    throw ApiError.badRequest('Payment exceeds the outstanding deal balance.')
  }

  const payment = await Payment.create({
    ...req.body,
    organization: req.organizationId,
    recordedBy: req.user._id,
  })

  const commission = await Commission.findOne({ deal: deal._id })
  if (commission) await recalculateCommission(commission._id)

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: deal.lead,
    deal: deal._id,
    type: 'payment.recorded',
    message: `Payment of ${(payment.amountPaise / 100).toFixed(2)} recorded for ${deal.businessName}.`,
    metadata: { amountPaise: payment.amountPaise, method: payment.method },
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.PAYMENT_RECORDED,
    entityType: 'Payment',
    entityId: payment._id,
    after: payment.toObject(),
  })

  res.status(201).json({
    payment,
    deal: (await attachFinancials([deal]))[0],
  })
})

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId }

  if (!isPrivileged(req.membership)) {
    const deals = await Deal.find({
      organization: req.organizationId,
      assignedTo: req.user._id,
    }).select('_id')
    filter.deal = { $in: deals.map((deal) => deal._id) }
  }
  if (req.query.deal) filter.deal = req.query.deal
  if (req.query.method) filter.method = req.query.method
  if (req.query.from || req.query.to) {
    filter.receivedAt = {}
    if (req.query.from) filter.receivedAt.$gte = req.query.from
    if (req.query.to) filter.receivedAt.$lte = req.query.to
  }

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('deal', 'businessName status amountPaise')
      .populate('recordedBy', 'name email')
      .sort('-receivedAt')
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ])

  res.json(paginatedResponse({ items, total, page, limit }))
})

export const dealSummary = asyncHandler(async (req, res) => {
  const scope = { organization: req.organizationId }
  if (!isPrivileged(req.membership)) scope.assignedTo = req.user._id
  const deals = await Deal.find(scope).select('_id status amountPaise')
  const ids = deals.map((deal) => deal._id)
  const [payments, commissions] = await Promise.all([
    Payment.aggregate([
      { $match: { organization: req.organizationId, deal: { $in: ids } } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ]),
    Commission.aggregate([
      { $match: { organization: req.organizationId, deal: { $in: ids } } },
      {
        $group: {
          _id: null,
          earned: { $sum: '$earnedCommissionPaise' },
          approved: { $sum: '$approvedCommissionPaise' },
          paid: { $sum: '$paidCommissionPaise' },
        },
      },
    ]),
  ])
  const sumBy = (status) =>
    deals
      .filter((deal) => deal.status === status)
      .reduce((total, deal) => total + deal.amountPaise, 0)
  const collected = payments[0]?.total || 0
  const totalValue = deals.reduce((total, deal) => total + deal.amountPaise, 0)
  res.json({
    count: deals.length,
    openCount: deals.filter((deal) => deal.status === 'open').length,
    wonCount: deals.filter((deal) => deal.status === 'won').length,
    lostCount: deals.filter((deal) => deal.status === 'lost').length,
    openValuePaise: sumBy('open'),
    wonValuePaise: sumBy('won'),
    totalValuePaise: totalValue,
    collectedPaise: collected,
    outstandingPaise: Math.max(0, totalValue - collected),
    commissionEarnedPaise: commissions[0]?.earned || 0,
    commissionApprovedPaise: commissions[0]?.approved || 0,
    commissionPaidPaise: commissions[0]?.paid || 0,
  })
})
