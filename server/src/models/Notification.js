import mongoose from 'mongoose'
import { NOTIFICATION_TYPES } from '../config/constants.js'

const notificationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
    title: { type: String, required: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 1000 },
    link: { type: String, maxlength: 300, default: '' },
    dedupeKey: { type: String, maxlength: 200, default: undefined },
    readAt: Date,
  },
  { timestamps: true, versionKey: false },
)

notificationSchema.index({ organization: 1, user: 1, createdAt: -1 })
notificationSchema.index({ organization: 1, user: 1, readAt: 1 })
notificationSchema.index(
  { organization: 1, user: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } },
)

export const Notification = mongoose.model('Notification', notificationSchema)
