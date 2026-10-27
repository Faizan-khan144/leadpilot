import { Router } from 'express'
import {
  bulkAssignLeads,
  createLead,
  deleteLead,
  exportLeads,
  getLead,
  importLeads,
  listLeads,
  updateLead,
  updateLeadStage,
} from '../controllers/lead.controller.js'
import { getPipelineBoard } from '../controllers/pipeline.controller.js'
import { protect, requireOrganization } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  bulkAssignSchema,
  createLeadSchema,
  importLeadsSchema,
  leadIdParamSchema,
  leadListQuerySchema,
  pipelineBoardQuerySchema,
  updateLeadSchema,
  updateLeadStageSchema,
} from '../validators/lead.validator.js'

const router = Router()

router.use(protect, requireOrganization)

router.get('/', validate(leadListQuerySchema, 'query'), listLeads)
router.get('/board', validate(pipelineBoardQuerySchema, 'query'), getPipelineBoard)
router.get('/export', validate(leadListQuerySchema, 'query'), exportLeads)
router.post('/import', validate(importLeadsSchema), importLeads)
router.post('/bulk-assign', validate(bulkAssignSchema), bulkAssignLeads)
router.post('/', validate(createLeadSchema), createLead)
router.get('/:id', validate(leadIdParamSchema, 'params'), getLead)
router.patch(
  '/:id',
  validate(leadIdParamSchema, 'params'),
  validate(updateLeadSchema),
  updateLead,
)
router.patch(
  '/:id/stage',
  validate(leadIdParamSchema, 'params'),
  validate(updateLeadStageSchema),
  updateLeadStage,
)
router.delete('/:id', validate(leadIdParamSchema, 'params'), deleteLead)

export default router
