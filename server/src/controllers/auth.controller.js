import { AUDIT_ACTIONS } from '../config/constants.js'
import { env } from '../config/env.js'
import {
  acceptInvitation,
  authenticateUser,
  issueSession,
  previewInvitation,
  registerUser,
  requestPasswordReset,
  resetPassword,
  serializeSession,
} from '../services/auth.service.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recordAudit } from '../utils/audit.js'
import { clearAuthCookie } from '../utils/tokens.js'

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body)
  const session = await issueSession(res, user)

  await recordAudit({
    req: { ...req, user },
    organization: session.activeOrganization?.id,
    action: AUDIT_ACTIONS.LOGIN,
    entityType: 'User',
    entityId: user._id,
    after: { email: user.email },
  })

  res.status(201).json(session)
})

export const login = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req.body)
  const session = await issueSession(res, user, { remember: req.body.remember !== false })

  await recordAudit({
    req: { ...req, user },
    organization: session.activeOrganization?.id,
    action: AUDIT_ACTIONS.LOGIN,
    entityType: 'User',
    entityId: user._id,
  })

  res.json(session)
})

export const logout = asyncHandler(async (req, res) => {
  if (req.user && req.membership) {
    await recordAudit({
      req,
      organization: req.organizationId,
      action: AUDIT_ACTIONS.LOGOUT,
      entityType: 'User',
      entityId: req.user._id,
    })
  }
  clearAuthCookie(res)
  res.status(204).send()
})

export const me = asyncHandler(async (req, res) => {
  res.json(await serializeSession(req.user))
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await requestPasswordReset(req.body.email)
  res.json({
    message: 'If an account exists for that email, a reset link has been sent.',
    ...(env.nodeEnv === 'production' ? {} : { devResetToken: result.devResetToken }),
  })
})

export const resetUserPassword = asyncHandler(async (req, res) => {
  await resetPassword(req.body)
  res.json({ message: 'Your password has been updated. You can now sign in.' })
})

export const invitationPreview = asyncHandler(async (req, res) => {
  const token = req.params.token
  if (!token) throw ApiError.badRequest('Invitation token is required')
  res.json(await previewInvitation(token))
})

export const acceptInvite = asyncHandler(async (req, res) => {
  const user = await acceptInvitation(req.body)
  const session = await issueSession(res, user)
  res.json(session)
})
