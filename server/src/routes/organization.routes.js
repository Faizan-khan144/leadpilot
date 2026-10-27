import { Router } from 'express'
import {
  getAuditLogs,
  getCurrentOrganization,
  listOrganizations,
  updateCommissionRules,
  updateOrganization,
} from '../controllers/organization.controller.js'
import { protect, requireOrganization, requireOwner } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { commissionRulesSchema } from '../validators/deal.validator.js'
import { updateOrganizationSchema } from '../validators/organization.validator.js'

const router = Router()

router.get('/', protect, listOrganizations)
router.get('/current', protect, requireOrganization, getCurrentOrganization)
router.patch(
  '/current',
  protect,
  requireOrganization,
  requireOwner,
  validate(updateOrganizationSchema),
  updateOrganization,
)
router.put(
  '/current/commission-rules',
  protect,
  requireOrganization,
  requireOwner,
  validate(commissionRulesSchema),
  updateCommissionRules,
)
router.get('/current/audit-logs', protect, requireOrganization, requireOwner, getAuditLogs)

export default router
