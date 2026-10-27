import mongoose from 'mongoose'
import { Lead } from '../models/Lead.js'
import { CallLog } from '../models/CallLog.js'
import { FollowUp } from '../models/FollowUp.js'
import { Deal } from '../models/Deal.js'
import { Payment } from '../models/Payment.js'
import { Commission } from '../models/Commission.js'
import { Activity } from '../models/Activity.js'
import { Membership } from '../models/Membership.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isPrivileged } from '../utils/permissions.js'
import { LEAD_STATUSES } from '../config/constants.js'

const toObjectId = (value) => new mongoose.Types.ObjectId(String(value))

const resolveRange = (query) => {
  const to = query.to ? new Date(query.to) : new Date()
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000)
  return { from, to }
}

const scopeFor = (req) => {
  if (!isPrivileged(req.membership)) {
    return { assignee: String(req.user._id), unrestricted: false }
  }
  if (req.query.assignedTo) {
    return { assignee: String(req.query.assignedTo), unrestricted: false }
  }
  return { assignee: null, unrestricted: true }
}

const leadMatch = (req, range, scope, extra = {}) => ({
  organization: req.organizationId,
  deletedAt: null,
  ...(scope.assignee ? { assignedTo: toObjectId(scope.assignee) } : {}),
  ...extra,
})

const dayExpression = (field, timezone) => ({
  $dateToString: { format: '%Y-%m-%d', date: field, timezone },
})

export const getDashboard = asyncHandler(async (req, res) => {
  const range = resolveRange(req.query)
  const scope = scopeFor(req)
  const orgId = req.organizationId
  const timezone = req.organization.timezone || 'Asia/Kolkata'
  const now = new Date()

  const dealMatch = {
    organization: toObjectId(orgId),
    ...(scope.assignee ? { assignedTo: toObjectId(scope.assignee) } : {}),
  }
  const deals = await Deal.find(dealMatch).select('_id amountPaise status actualClosingDate')
  const dealIds = deals.map((deal) => deal._id)

  const callMatch = {
    organization: toObjectId(orgId),
    ...(scope.assignee ? { user: toObjectId(scope.assignee) } : {}),
  }

  const [
    totalLeads,
    newLeads,
    calls,
    interestedLeadIds,
    followUpsDue,
    meetingsBooked,
    dealsWon,
    dealsLost,
    payments,
    commissions,
    pipeline,
    acquisition,
    callLeaderboard,
    dealLeaderboard,
    meetingLeaderboard,
    recentActivities,
    upcomingFollowUps,
    totalWon,
  ] = await Promise.all([
    Lead.countDocuments(leadMatch(req, range, scope)),
    Lead.countDocuments({
      ...leadMatch(req, range, scope),
      createdAt: { $gte: range.from, $lte: range.to },
    }),
    CallLog.countDocuments({ ...callMatch, calledAt: { $gte: range.from, $lte: range.to } }),
    CallLog.distinct('lead', {
      ...callMatch,
      outcome: { $in: ['Interested', 'Meeting Requested'] },
      calledAt: { $gte: range.from, $lte: range.to },
    }),
    FollowUp.countDocuments({
      organization: orgId,
      status: 'pending',
      dueAt: { $lte: now },
      ...(scope.assignee ? { assignedTo: scope.assignee } : {}),
    }),
    CallLog.countDocuments({
      ...callMatch,
      outcome: 'Meeting Requested',
      calledAt: { $gte: range.from, $lte: range.to },
    }),
    Deal.countDocuments({
      ...dealMatch,
      status: 'won',
      actualClosingDate: { $gte: range.from, $lte: range.to },
    }),
    Deal.countDocuments({
      ...dealMatch,
      status: 'lost',
      actualClosingDate: { $gte: range.from, $lte: range.to },
    }),
    Payment.aggregate([
      {
        $match: {
          organization: toObjectId(orgId),
          deal: { $in: dealIds },
          receivedAt: { $gte: range.from, $lte: range.to },
        },
      },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ]),
    Commission.aggregate([
      {
        $match: {
          organization: toObjectId(orgId),
          ...(scope.assignee ? { member: toObjectId(scope.assignee) } : {}),
        },
      },
      {
        $group: {
          _id: null,
          pending: { $sum: '$pendingCommissionPaise' },
          earned: { $sum: '$earnedCommissionPaise' },
          approved: { $sum: '$approvedCommissionPaise' },
          paid: { $sum: '$paidCommissionPaise' },
        },
      },
    ]),
    Lead.aggregate([
      { $match: leadMatch(req, range, scope) },
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$estimatedValuePaise' } } },
    ]),
    Lead.aggregate([
      {
        $match: {
          ...leadMatch(req, range, scope),
          createdAt: { $gte: range.from, $lte: range.to },
        },
      },
      {
        $group: {
          _id: dayExpression('$createdAt', timezone),
          leads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    CallLog.aggregate([
      { $match: { ...callMatch, calledAt: { $gte: range.from, $lte: range.to } } },
      {
        $group: {
          _id: '$user',
          calls: { $sum: 1 },
          meetings: {
            $sum: { $cond: [{ $eq: ['$outcome', 'Meeting Requested'] }, 1, 0] },
          },
        },
      },
    ]),
    Deal.aggregate([
      {
        $match: {
          ...dealMatch,
          status: 'won',
          actualClosingDate: { $gte: range.from, $lte: range.to },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          deals: { $sum: 1 },
          revenue: { $sum: '$amountPaise' },
        },
      },
    ]),
    FollowUp.aggregate([
      {
        $match: {
          organization: toObjectId(orgId),
          type: 'meeting',
          status: 'completed',
          completedAt: { $gte: range.from, $lte: range.to },
          ...(scope.assignee ? { assignedTo: toObjectId(scope.assignee) } : {}),
        },
      },
      { $group: { _id: '$assignedTo', meetings: { $sum: 1 } } },
    ]),
    Activity.find({
      organization: orgId,
      ...(scope.assignee
        ? {
            $or: [
              { actor: toObjectId(scope.assignee) },
              { lead: { $in: await Lead.find(leadMatch(req, range, scope)).distinct('_id') } },
            ],
          }
        : {}),
    })
      .populate('actor', 'name email avatarColor')
      .populate('lead', 'businessName')
      .sort('-createdAt')
      .limit(8),
    FollowUp.find({
      organization: orgId,
      status: 'pending',
      dueAt: { $gte: now },
      ...(scope.assignee ? { assignedTo: scope.assignee } : {}),
    })
      .populate('lead', 'businessName priority status')
      .populate('assignedTo', 'name email avatarColor')
      .sort('dueAt')
      .limit(6),
    Deal.aggregate([
      {
        $match: { ...dealMatch, status: 'won' },
      },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ]),
  ])

  const members = await Membership.find({
    organization: orgId,
    status: 'active',
    user: { $ne: null },
  })
    .populate('user', 'name email avatarColor')
    .select('user role')

  const callMap = new Map(callLeaderboard.map((row) => [String(row._id), row]))
  const dealMap = new Map(dealLeaderboard.map((row) => [String(row._id), row]))
  const meetingMap = new Map(meetingLeaderboard.map((row) => [String(row._id), row]))
  const leaderboard = members
    .map((membership) => {
      const key = String(membership.user?._id)
      const calls = callMap.get(key)?.calls || 0
      const deals = dealMap.get(key)?.deals || 0
      const revenue = dealMap.get(key)?.revenue || 0
      return {
        user: membership.user,
        role: membership.role,
        calls,
        meetings:
          (callMap.get(key)?.meetings || 0) +
          (meetingMap.get(key)?.meetings || 0),
        dealsWon: deals,
        revenuePaise: revenue,
      }
    })
    .sort(
      (a, b) =>
        b.revenuePaise - a.revenuePaise ||
        b.calls - a.calls ||
        b.meetings - a.meetings,
    )
    .slice(0, 8)

  const pipelineMap = new Map(pipeline.map((row) => [row._id, row]))
  const totalLeadCount = await Lead.countDocuments(leadMatch(req, range, scope))
  const wonCount = await Deal.countDocuments({ ...dealMatch, status: 'won' })

  const commission = commissions[0] || {
    pending: 0,
    earned: 0,
    approved: 0,
    paid: 0,
  }

  res.json({
    range: { from: range.from, to: range.to },
    metrics: {
      totalLeads,
      newLeads,
      calls,
      interestedProspects: interestedLeadIds.length,
      followUpsDue,
      meetingsBooked,
      dealsWon,
      dealsLost,
      totalDealValuePaise: totalWon[0]?.total || 0,
      openPipelineValuePaise: deals
        .filter((deal) => deal.status === 'open')
        .reduce((total, deal) => total + deal.amountPaise, 0),
      paymentsReceivedPaise: payments[0]?.total || 0,
      pendingCommissionPaise: commission.pending,
      payableCommissionPaise: Math.max(0, commission.approved - commission.paid),
      earnedCommissionPaise: commission.earned,
      conversionRate:
        totalLeadCount > 0 ? Number(((wonCount / totalLeadCount) * 100).toFixed(1)) : 0,
    },
    leadAcquisition: acquisition.map((row) => ({ date: row._id, leads: row.leads })),
    pipeline: LEAD_STATUSES.map((status) => ({
      status,
      count: pipelineMap.get(status)?.count || 0,
      valuePaise: pipelineMap.get(status)?.value || 0,
    })),
    leaderboard,
    recentActivities,
    upcomingFollowUps,
  })
})

export const getReports = asyncHandler(async (req, res) => {
  const range = resolveRange(req.query)
  const scope = scopeFor(req)
  const orgId = req.organizationId
  const timezone = req.organization.timezone || 'Asia/Kolkata'
  const dealMatch = {
    organization: toObjectId(orgId),
    ...(scope.assignee ? { assignedTo: toObjectId(scope.assignee) } : {}),
  }
  const deals = await Deal.find(dealMatch).select('_id')
  const dealIds = deals.map((deal) => deal._id)
  const callMatch = {
    organization: toObjectId(orgId),
    ...(scope.assignee ? { user: toObjectId(scope.assignee) } : {}),
    calledAt: { $gte: range.from, $lte: range.to },
  }

  const [
    bySource,
    byIndustry,
    byStatus,
    callsByMember,
    revenueOverTime,
    wonLost,
    commissions,
    members,
  ] = await Promise.all([
    Lead.aggregate([
      { $match: leadMatch(req, range, scope) },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Lead.aggregate([
      { $match: leadMatch(req, range, scope) },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$industry', ''] }, 'Unspecified', '$industry'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Lead.aggregate([
      { $match: leadMatch(req, range, scope) },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    CallLog.aggregate([
      { $match: callMatch },
      {
        $group: {
          _id: '$user',
          calls: { $sum: 1 },
          meetings: {
            $sum: { $cond: [{ $eq: ['$outcome', 'Meeting Requested'] }, 1, 0] },
          },
          interested: {
            $sum: {
              $cond: [
                { $in: ['$outcome', ['Interested', 'Meeting Requested']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          organization: toObjectId(orgId),
          deal: { $in: dealIds },
          receivedAt: { $gte: range.from, $lte: range.to },
        },
      },
      {
        $group: {
          _id: dayExpression('$receivedAt', timezone),
          amountPaise: { $sum: '$amountPaise' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Deal.aggregate([
      {
        $match: {
          ...dealMatch,
          status: { $in: ['won', 'lost'] },
          actualClosingDate: { $gte: range.from, $lte: range.to },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amountPaise: { $sum: '$amountPaise' },
        },
      },
    ]),
    Commission.aggregate([
      {
        $match: {
          organization: toObjectId(orgId),
          ...(scope.assignee ? { member: toObjectId(scope.assignee) } : {}),
          createdAt: { $gte: range.from, $lte: range.to },
        },
      },
      {
        $group: {
          _id: '$member',
          calculated: { $sum: '$calculatedCommissionPaise' },
          earned: { $sum: '$earnedCommissionPaise' },
          approved: { $sum: '$approvedCommissionPaise' },
          paid: { $sum: '$paidCommissionPaise' },
        },
      },
    ]),
    Membership.find({ organization: orgId, status: 'active', user: { $ne: null } })
      .populate('user', 'name email')
      .select('user role'),
  ])

  const memberMap = new Map(
    members.map((membership) => [String(membership.user?._id), membership]),
  )
  const callMap = new Map(callsByMember.map((row) => [String(row._id), row]))
  const commissionMap = new Map(commissions.map((row) => [String(row._id), row]))
  const statusMap = new Map(byStatus.map((row) => [row._id, row.count]))

  res.json({
    range: { from: range.from, to: range.to },
    leadsBySource: bySource.map((row) => ({ source: row._id, count: row.count })),
    leadsByIndustry: byIndustry.map((row) => ({ industry: row._id, count: row.count })),
    leadsByStatus: LEAD_STATUSES.map((status) => ({
      status,
      count: statusMap.get(status) || 0,
    })),
    callsByMember: [...memberMap.entries()].map(([id, membership]) => ({
      userId: id,
      name: membership.user?.name || 'Unknown',
      email: membership.user?.email || '',
      calls: callMap.get(id)?.calls || 0,
      meetings: callMap.get(id)?.meetings || 0,
      interested: callMap.get(id)?.interested || 0,
    })),
    revenueOverTime: revenueOverTime.map((row) => ({
      date: row._id,
      amountPaise: row.amountPaise,
    })),
    dealsWonLost: ['won', 'lost'].map((status) => ({
      status,
      count: wonLost.find((row) => row._id === status)?.count || 0,
      amountPaise: wonLost.find((row) => row._id === status)?.amountPaise || 0,
    })),
    commissions: [...memberMap.entries()].map(([id, membership]) => ({
      userId: id,
      name: membership.user?.name || 'Unknown',
      email: membership.user?.email || '',
      calculatedCommissionPaise: commissionMap.get(id)?.calculated || 0,
      earnedCommissionPaise: commissionMap.get(id)?.earned || 0,
      approvedCommissionPaise: commissionMap.get(id)?.approved || 0,
      paidCommissionPaise: commissionMap.get(id)?.paid || 0,
    })),
  })
})
