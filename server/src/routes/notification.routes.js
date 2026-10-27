import { Router } from 'express'
import {
  listNotifications,
  markAllRead,
  markNotificationRead,
  unreadCount,
} from '../controllers/notification.controller.js'
import { protect, requireOrganization } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
} from '../validators/organization.validator.js'

const router = Router()
router.use(protect, requireOrganization)

router.get('/', validate(notificationListQuerySchema, 'query'), listNotifications)
router.get('/unread-count', unreadCount)
router.patch('/read-all', markAllRead)
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  markNotificationRead,
)

export default router
