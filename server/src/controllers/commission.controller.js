import { Commission } from '../models/Commission.js'
import { Membership } from '../models/Membership.js'
import { Deal } from '../models/Deal.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, paginatedResponse } from '../utils/query.js'
import { isPrivileged, isOwner } from '../utils/permissions.js'
import { recordAudit } from '../utils/audit.js'
import { AUDIT_ACTIONS } from '../config/constants.js'
import { logActivity } from '../services/activity.service.js'
import { createNotification } from '../services/notification.service.js'
import {
  approveCommission,
  payCommission,
  resolveCommissionRule,
  calculateCommission,
} from '../services/commission.service.js'

const scopeFor = async (req) => {
  if (req.membership.role === 'owner') return {}
  if (req.membership.role === 'manager') {
    const reports = await Membership.find({
      organization: req.organizationId,
      manager: req.user._id,
      status: 'active',
    }).select('user')
    return {
      member: { $in: [req.user._id, ...reports.map((item) => item.user)] },
    }
  }
  return { member: req.user._id }
}

export const listCommissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId, ...(await scopeFor(req)) }
  if (req.query.status) filter.status = req.query.status
  if (req.query.member && isPrivileged(req.membership)) filter.member = req.query.member
  if (req.query.from || req.query.to) {
    filter.createdAt = {}
    if (req.query.from) filter.createdAt.$gte = req.query.from
    if (req.query.to) filter.createdAt.$lte = req.query.to
  }

  const [items, total, summary] = await Promise.all([
    Commission.find(filter)
      .populate('deal', 'businessName status amountPaise actualClosingDate')
      .populate('member', 'name email avatarColor')
      .populate('approvals.approvedBy', 'name email')
      .populate('payouts.paidBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Commission.countDocuments(filter),
    Commission.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          calculatedCommissionPaise: { $sum: '$calculatedCommissionPaise' },
          earnedCommissionPaise: { $sum: '$earnedCommissionPaise' },
          pendingCommissionPaise: { $sum: '$pendingCommissionPaise' },
          approvedCommissionPaise: { $sum: '$approvedCommissionPaise' },
          paidCommissionPaise: { $sum: '$paidCommissionPaise' },
          receivedPaise: { $sum: '$receivedPaise' },
        },
      },
    ]),
  ])

  res.json({
    ...paginatedResponse({ items, total, page, limit }),
    summary:
      summary[0] || {
        calculatedCommissionPaise: 0,
        earnedCommissionPaise: 0,
        pendingCommissionPaise: 0,
        approvedCommissionPaise: 0,
        paidCommissionPaise: 0,
        receivedPaise: 0,
      },
  })
})

export const getCommission = asyncHandler(async (req, res) => {
  const commission = await Commission.findOne({
    _id: req.params.id,
    organization: req.organizationId,
    ...(await scopeFor(req)),
  })
    .populate('deal', 'businessName status amountPaise lead actualClosingDate')
    .populate('member', 'name email avatarColor')
    .populate('approvals.approvedBy', 'name email')
    .populate('payouts.paidBy', 'name email')

  if (!commission) throw ApiError.notFound('Commission not found')
  res.json({ commission })
})

export const approve = asyncHandler(async (req, res) => {
  const commission = await Commission.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!commission) throw ApiError.notFound('Commission not found')

  const updated = await approveCommission({
    commission,
    amountPaise: req.body.amountPaise,
    user: req.user,
    note: req.body.note,
  })

  const deal = await Deal.findById(updated.deal).select('lead businessName')

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: deal?.lead,
    deal: updated.deal,
    type: 'commission.approved',
    message: `Commission approved for ${deal?.businessName || 'a deal'}.`,
    metadata: { amountPaise: req.body.amountPaise },
  })

  await createNotification({
    organization: req.organizationId,
    user: updated.member,
    type: 'commission',
    title: 'Commission approved',
    message: `${(req.body.amountPaise / 100).toFixed(2)} was approved for payout.`,
    link: '/commissions',
    dedupeKey: `commission-approved-${updated._id}-${updated.approvedCommissionPaise}`,
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.COMMISSION_APPROVED,
    entityType: 'Commission',
    entityId: updated._id,
    after: { amountPaise: req.body.amountPaise, note: req.body.note || '' },
  })

  res.json({ commission: updated, message: 'Commission approved.' })
})

export const payout = asyncHandler(async (req, res) => {
  const commission = await Commission.findOne({
    _id: req.params.id,
    organization: req.organizationId,
  })
  if (!commission) throw ApiError.notFound('Commission not found')

  const updated = await payCommission({
    commission,
    amountPaise: req.body.amountPaise,
    method: req.body.method,
    reference: req.body.reference,
    note: req.body.note,
    paidAt: req.body.paidAt,
    user: req.user,
  })

  const deal = await Deal.findById(updated.deal).select('lead businessName')

  await logActivity({
    organization: req.organizationId,
    actor: req.user._id,
    lead: deal?.lead,
    deal: updated.deal,
    type: 'commission.paid',
    message: `Commission payout recorded for ${deal?.businessName || 'a deal'}.`,
    metadata: { amountPaise: req.body.amountPaise, method: req.body.method },
  })

  await createNotification({
    organization: req.organizationId,
    user: updated.member,
    type: 'commission',
    title: 'Commission paid',
    message: `${(req.body.amountPaise / 100).toFixed(2)} was recorded as paid.`,
    link: '/commissions',
    dedupeKey: `commission-paid-${updated._id}-${updated.paidCommissionPaise}`,
  })

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.COMMISSION_PAID,
    entityType: 'Commission',
    entityId: updated._id,
    after: {
      amountPaise: req.body.amountPaise,
      method: req.body.method,
      reference: req.body.reference || '',
    },
  })

  res.json({ commission: updated, message: 'Commission payout recorded.' })
})

export const previewCommission = asyncHandler(async (req, res) => {
  const amountPaise = Number(req.query.amountPaise)
  if (!Number.isFinite(amountPaise) || amountPaise < 0) {
    throw ApiError.badRequest('amountPaise must be a positive number')
  }
  const rule = resolveCommissionRule(req.organization.commissionRules, amountPaise)
  res.json({
    ...calculateCommission({
      amountPaise,
      rules: req.organization.commissionRules,
    }),
    rule,
    basis: req.organization.commissionBasis,
  })
})
