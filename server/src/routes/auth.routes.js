import { Router } from 'express'
import {
  acceptInvite,
  forgotPassword,
  invitationPreview,
  login,
  logout,
  me,
  register,
  resetUserPassword,
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import {
  acceptInviteSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetUserPassword)
router.get('/invitations/:token', invitationPreview)
router.post('/accept-invite', authLimiter, validate(acceptInviteSchema), acceptInvite)
router.get('/me', protect, me)
router.post('/logout', protect, logout)

export default router
