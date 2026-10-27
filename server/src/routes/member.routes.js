import { Router } from 'express'
import { assignableMembers } from '../controllers/call.controller.js'
import {
  deactivateMember,
  inviteMember,
  listMembers,
  updateMember,
} from '../controllers/member.controller.js'
import { protect, requireOrganization, requireOwner } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { inviteMemberSchema } from '../validators/auth.validator.js'
import {
  memberIdParamSchema,
  memberListQuerySchema,
  updateMemberSchema,
} from '../validators/organization.validator.js'

const router = Router()
router.use(protect, requireOrganization)

router.get('/', validate(memberListQuerySchema, 'query'), listMembers)
router.get('/assignable', assignableMembers)
router.post('/invite', requireOwner, validate(inviteMemberSchema), inviteMember)
router.patch(
  '/:id',
  requireOwner,
  validate(memberIdParamSchema, 'params'),
  validate(updateMemberSchema),
  updateMember,
)
router.delete(
  '/:id',
  requireOwner,
  validate(memberIdParamSchema, 'params'),
  deactivateMember,
)

export default router
