import { Router } from 'express'
import {
  createDeal,
  createPayment,
  dealSummary,
  getDeal,
  listDeals,
  listPayments,
  updateDeal,
  updateDealStatus,
} from '../controllers/deal.controller.js'
import { protect, requireOrganization } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createDealSchema,
  createPaymentSchema,
  dealListQuerySchema,
  paymentListQuerySchema,
  updateDealSchema,
  updateDealStatusSchema,
} from '../validators/deal.validator.js'
import { z } from 'zod'
import { objectIdSchema } from '../validators/common.js'

const router = Router()
router.use(protect, requireOrganization)

router.get('/', validate(dealListQuerySchema, 'query'), listDeals)
router.post('/', validate(createDealSchema), createDeal)
router.get('/summary', dealSummary)
router.get('/payments', validate(paymentListQuerySchema, 'query'), listPayments)
router.post('/payments', validate(createPaymentSchema), createPayment)
router.get(
  '/:id',
  validate(z.object({ id: objectIdSchema }), 'params'),
  dealSummary,
  getDeal,
)
router.patch(
  '/:id',
  validate(z.object({ id: objectIdSchema }), 'params'),
  validate(updateDealSchema),
  updateDeal,
)
router.patch(
  '/:id/status',
  validate(z.object({ id: objectIdSchema }), 'params'),
  validate(updateDealStatusSchema),
  updateDealStatus,
)

export default router

