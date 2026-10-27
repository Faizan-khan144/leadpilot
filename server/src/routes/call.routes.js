import { Router } from 'express'
import { createCall, getCall, listCalls } from '../controllers/call.controller.js'
import { protect, requireOrganization } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { callListQuerySchema, createCallSchema } from '../validators/activity.validator.js'
import { z } from 'zod'
import { objectIdSchema } from '../validators/common.js'

const router = Router()
router.use(protect, requireOrganization)

router.get('/', validate(callListQuerySchema, 'query'), listCalls)
router.post('/', validate(createCallSchema), createCall)
router.get(
  '/:id',
  validate(z.object({ id: objectIdSchema }), 'params'),
  getCall,
)

export default router
