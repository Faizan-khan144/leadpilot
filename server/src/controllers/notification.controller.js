import { Notification } from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, paginatedResponse } from '../utils/query.js'

export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)
  const filter = {
    organization: req.organizationId,
    user: req.user._id,
  }
  if (req.query.unreadOnly) filter.readAt = null

  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      organization: req.organizationId,
      user: req.user._id,
      readAt: null,
    }),
  ])

  res.json({ ...paginatedResponse({ items, total, page, limit }), unread })
})

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    organization: req.organizationId,
    user: req.user._id,
    readAt: null,
  })
  res.json({ unread: count })
})

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      organization: req.organizationId,
      user: req.user._id,
    },
    { $set: { readAt: new Date() } },
    { new: true },
  )
  if (!notification) throw ApiError.notFound('Notification not found')
  res.json({ notification })
})

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      organization: req.organizationId,
      user: req.user._id,
      readAt: null,
    },
    { $set: { readAt: new Date() } },
  )
  res.json({ message: 'All notifications marked as read.', modified: result.modifiedCount })
})
