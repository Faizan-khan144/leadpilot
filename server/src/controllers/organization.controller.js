import { AUDIT_ACTIONS } from '../config/constants.js'
import { Organization } from '../models/Organization.js'
import { Membership } from '../models/Membership.js'
import { AuditLog } from '../models/AuditLog.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { recordAudit } from '../utils/audit.js'
import { getPagination, paginatedResponse } from '../utils/query.js'

export const listOrganizations = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    user: req.user._id,
    status: 'active',
  }).populate('organization')

  res.json(
    memberships
      .filter((membership) => membership.organization)
      .map((membership) => ({
        id: membership.organization._id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
        currency: membership.organization.currency,
        timezone: membership.organization.timezone,
      })),
  )
})

export const getCurrentOrganization = asyncHandler(async (req, res) => {
  res.json({
    organization: req.organization,
    membership: {
      id: req.membership._id,
      role: req.membership.role,
      manager: req.membership.manager,
      joinedAt: req.membership.joinedAt,
    },
  })
})

export const updateOrganization = asyncHandler(async (req, res) => {
  const before = req.organization.toObject()
  Object.assign(req.organization, req.body)
  await req.organization.save()

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.ORGANIZATION_UPDATED,
    entityType: 'Organization',
    entityId: req.organizationId,
    before,
    after: req.organization.toObject(),
  })

  res.json({ organization: req.organization, message: 'Organization updated.' })
})

export const updateCommissionRules = asyncHandler(async (req, res) => {
  const before = {
    commissionBasis: req.organization.commissionBasis,
    commissionRules: req.organization.commissionRules,
    approvalRequired: req.organization.approvalRequired,
    paymentPolicyNotes: req.organization.paymentPolicyNotes,
  }

  req.organization.commissionBasis = req.body.commissionBasis
  req.organization.commissionRules = req.body.commissionRules
  if (req.body.approvalRequired !== undefined) {
    req.organization.approvalRequired = req.body.approvalRequired
  }
  if (req.body.paymentPolicyNotes !== undefined) {
    req.organization.paymentPolicyNotes = req.body.paymentPolicyNotes
  }
  await req.organization.save()

  await recordAudit({
    req,
    organization: req.organizationId,
    action: AUDIT_ACTIONS.COMMISSION_RULES_UPDATED,
    entityType: 'Organization',
    entityId: req.organizationId,
    before,
    after: {
      commissionBasis: req.organization.commissionBasis,
      commissionRules: req.organization.commissionRules,
      approvalRequired: req.organization.approvalRequired,
      paymentPolicyNotes: req.organization.paymentPolicyNotes,
    },
  })

  res.json({
    organization: req.organization,
    message: 'Commission rules updated. Existing deals keep their captured rate.',
  })
})

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = { organization: req.organizationId }
  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actor', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ])
  res.json(paginatedResponse({ items, total, page, limit }))
})

export const getOrganizationBySlug = asyncHandler(async (req, res) => {
  const organization = await Organization.findOne({ slug: req.params.slug }).select(
    'name slug currency timezone createdAt',
  )
  if (!organization) throw ApiError.notFound('Organization not found')
  res.json({ organization })
})
