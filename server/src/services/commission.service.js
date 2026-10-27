import { Commission } from '../models/Commission.js'
import { Payment } from '../models/Payment.js'
import { ApiError } from '../utils/ApiError.js'
import { percentageOf, ratioOf } from '../utils/money.js'
import { DEFAULT_COMMISSION_RULES } from '../config/constants.js'

const normalizeRules = (rules = []) =>
  [...rules]
    .map((rule) => ({
      minPaise: Number(rule.minPaise),
      maxPaise: rule.maxPaise === null || rule.maxPaise === undefined ? null : Number(rule.maxPaise),
      ratePercent: Number(rule.ratePercent),
    }))
    .sort((a, b) => a.minPaise - b.minPaise)

export const resolveCommissionRule = (rules, amountPaise) => {
  const normalized = normalizeRules(rules?.length ? rules : DEFAULT_COMMISSION_RULES)
  const amount = Number(amountPaise)
  const rule = normalized.find(
    (entry) =>
      amount >= entry.minPaise && (entry.maxPaise === null || amount < entry.maxPaise),
  )
  if (!rule) {
    throw ApiError.unprocessable('No commission rule matches this deal amount.')
  }
  return rule
}

export const calculateCommission = ({ amountPaise, rules }) => {
  const rule = resolveCommissionRule(rules, amountPaise)
  return {
    ratePercent: rule.ratePercent,
    calculatedCommissionPaise: percentageOf(amountPaise, rule.ratePercent),
  }
}

export const createCommissionSnapshot = ({ amountPaise, organization }) => {
  const rule = resolveCommissionRule(organization.commissionRules, amountPaise)
  return {
    basis: organization.commissionBasis,
    ratePercent: rule.ratePercent,
    calculatedCommissionPaise: percentageOf(amountPaise, rule.ratePercent),
    rulesVersion: 'captured-at-deal-creation',
    capturedAt: new Date(),
  }
}

const deriveStatus = ({ calculated, approved, paid }) => {
  if (calculated > 0 && paid >= calculated) return 'paid'
  if (calculated > 0 && approved >= calculated) return 'approved'
  if (approved > 0) return 'partially_approved'
  return 'pending'
}

export const recalculateCommission = async (commissionId, options = {}) => {
  const commission = await Commission.findById(commissionId)
  if (!commission) throw ApiError.notFound('Commission record not found')

  const payments = await Payment.aggregate([
    {
      $match: {
        organization: commission.organization,
        deal: commission.deal,
      },
    },
    { $group: { _id: null, total: { $sum: '$amountPaise' } } },
  ])
  const received = payments[0]?.total || 0

  let earned
  if (commission.basis === 'payments_received') {
    earned = Math.min(
      commission.calculatedCommissionPaise,
      percentageOf(received, commission.ratePercent),
    )
  } else {
    earned = Math.round(
      commission.calculatedCommissionPaise *
        ratioOf(received, commission.dealAmountPaise),
    )
  }

  commission.receivedPaise = received
  commission.earnedCommissionPaise = Math.max(0, earned)
  commission.pendingCommissionPaise = Math.max(
    0,
    commission.calculatedCommissionPaise - commission.earnedCommissionPaise,
  )
  commission.approvedCommissionPaise = commission.approvals.reduce(
    (total, item) => total + item.amountPaise,
    0,
  )
  commission.paidCommissionPaise = commission.payouts.reduce(
    (total, item) => total + item.amountPaise,
    0,
  )
  commission.status = deriveStatus({
    calculated: commission.calculatedCommissionPaise,
    approved: commission.approvedCommissionPaise,
    paid: commission.paidCommissionPaise,
  })

  if (options.session) {
    await commission.save({ session: options.session })
  } else {
    await commission.save()
  }
  return commission
}

export const createCommissionForDeal = async (deal) => {
  const existing = await Commission.findOne({ deal: deal._id })
  if (existing) return existing

  return Commission.create({
    organization: deal.organization,
    deal: deal._id,
    member: deal.assignedTo,
    basis: deal.commissionSnapshot.basis,
    dealAmountPaise: deal.amountPaise,
    ratePercent: deal.commissionSnapshot.ratePercent,
    calculatedCommissionPaise: deal.commissionSnapshot.calculatedCommissionPaise,
    receivedPaise: 0,
    earnedCommissionPaise: 0,
    pendingCommissionPaise: deal.commissionSnapshot.calculatedCommissionPaise,
    status: 'pending',
  })
}

export const approveCommission = async ({ commission, amountPaise, user, note }) => {
  const earned = commission.earnedCommissionPaise
  const alreadyApproved = commission.approvedCommissionPaise
  const available = Math.max(0, earned - alreadyApproved)

  if (amountPaise > available) {
    throw ApiError.badRequest(
      `Approval exceeds the releaseable commission. Available: ${available} paise.`,
    )
  }
  if (commission.payouts.reduce((sum, item) => sum + item.amountPaise, 0) > alreadyApproved) {
    throw ApiError.conflict('Paid amount exceeds approved commission. Reconcile the payouts first.')
  }

  commission.approvals.push({
    amountPaise,
    approvedBy: user._id,
    approvedAt: new Date(),
    note: note || '',
  })
  await commission.save()
  return recalculateCommission(commission._id)
}

export const payCommission = async ({
  commission,
  amountPaise,
  method,
  reference,
  note,
  paidAt,
  user,
}) => {
  const payable = Math.max(
    0,
    commission.approvedCommissionPaise - commission.paidCommissionPaise,
  )
  if (amountPaise > payable) {
    throw ApiError.badRequest(
      `Payout exceeds the approved payable amount. Available: ${payable} paise.`,
    )
  }

  commission.payouts.push({
    amountPaise,
    paidBy: user._id,
    paidAt,
    method,
    reference: reference || '',
    note: note || '',
  })
  await commission.save()
  return recalculateCommission(commission._id)
}
