import { Router } from 'express'
import {
  completeFollowUp,
  createFollowUp,
  followUpSummary,
  listFollowUps,
  rescheduleFollowUp,
} from '../controllers/followUp.controller.js'
import { protect, requireOrganization } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  completeFollowUpSchema,
  createFollowUpSchema,
  followUpListQuerySchema,
  updateFollowUpSchema,
} from '../validators/activity.validator.js'
import { z } from 'zod'
import { objectIdSchema } from '../validators/common.js'

const router = Router()
router.use(protect, requireOrganization)

router.get('/summary', followUpSummary)
router.get('/', validate(followUpListQuerySchema, 'query'), listFollowUps)
router.post('/', validate(createFollowUpSchema), createFollowUp)
router.patch(
  '/:id/complete',
  validate(z.object({ id: objectIdSchema }), 'params'),
  validate(completeFollowUpSchema),
  completeFollowUp,
)
router.patch(
  '/:id/reschedule',
  validate(z.object({ id: objectIdSchema }), 'params'),
  validate(updateFollowUpSchema),
  rescheduleFollowUp,
)

export default router
