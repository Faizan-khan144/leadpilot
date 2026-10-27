import { Router } from 'express'
import { getDashboard, getReports } from '../controllers/analytics.controller.js'
import { protect, requireOrganization } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  analyticsQuerySchema,
  reportQuerySchema,
} from '../validators/organization.validator.js'

const router = Router()
router.use(protect, requireOrganization)

router.get('/dashboard', validate(analyticsQuerySchema, 'query'), getDashboard)
router.get('/reports', validate(reportQuerySchema, 'query'), getReports)

export default router
