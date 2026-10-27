import { Router } from 'express'
import { z } from 'zod'
import {
  approve,
  getCommission,
  listCommissions,
  payout,
  previewCommission,
} from '../controllers/commission.controller.js'
import {
  protect,
  requireFinanceAccess,
  requireOrganization,
} from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  approveCommissionSchema,
  payoutCommissionSchema,
} from '../validators/deal.validator.js'
import {
  objectIdSchema,
  paginationSchema,
  dateRangeSchema,
  positiveInt,
} from '../validators/common.js'
import { COMMISSION_STATUSES } from '../config/constants.js'

const commissionListQuerySchema = paginationSchema.merge(dateRangeSchema).extend({
  status: z.enum(COMMISSION_STATUSES).optional(),
  member: objectIdSchema.optional(),
})

const previewQuerySchema = z.object({
  amountPaise: positiveInt,
})

const commissionIdParams = z.object({ id: objectIdSchema })

const router = Router()
router.use(protect, requireOrganization)

router.get('/', validate(commissionListQuerySchema, 'query'), listCommissions)
router.get('/preview', validate(previewQuerySchema, 'query'), previewCommission)
router.get('/:id', validate(commissionIdParams, 'params'), getCommission)
router.post(
  '/:id/approve',
  requireFinanceAccess,
  validate(commissionIdParams, 'params'),
  validate(approveCommissionSchema),
  approve,
)
router.post(
  '/:id/payout',
  requireFinanceAccess,
  validate(commissionIdParams, 'params'),
  validate(payoutCommissionSchema),
  payout,
)

export default router
