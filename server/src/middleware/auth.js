import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertObjectId, verifyAuthToken } from '../utils/tokens.js'

const readToken = (req) => {
  if (req.cookies?.[env.cookieName]) return req.cookies[env.cookieName]
  const header = req.get('authorization')
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return null
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = readToken(req)
  if (!token) throw ApiError.unauthorized()

  let payload
  try {
    payload = verifyAuthToken(token)
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw ApiError.unauthorized('This account no longer exists.')

  req.user = user
  req.auth = payload
  next()
})

export const requireOrganization = asyncHandler(async (req, _res, next) => {
  const organizationId =
    req.get('x-organization-id') || req.query.organizationId || req.body?.organizationId

  if (!organizationId) {
    throw ApiError.badRequest('x-organization-id header is required')
  }
  assertObjectId(organizationId, 'organization id')

  const membership = await Membership.findOne({
    user: req.user._id,
    organization: organizationId,
    status: 'active',
  }).populate('organization')

  if (!membership || !membership.organization) {
    throw ApiError.forbidden('You do not have access to this organization.')
  }

  req.membership = membership
  req.organization = membership.organization
  req.organizationId = membership.organization._id
  next()
})

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.membership || !roles.includes(req.membership.role)) {
    return next(ApiError.forbidden())
  }
  return next()
}

export const requireOwner = requireRole('owner')

export const requireFinanceAccess = (req, _res, next) => {
  if (!req.membership) return next(ApiError.forbidden())
  if (req.membership.role === 'owner') return next()
  return next(ApiError.forbidden('Only an organization owner can perform this action.'))
}
