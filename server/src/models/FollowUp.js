import mongoose from 'mongoose'
import {
  FOLLOW_UP_STATUSES,
  FOLLOW_UP_TYPES,
  PRIORITIES,
} from '../config/constants.js'

const followUpSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: FOLLOW_UP_TYPES, default: 'follow_up' },
    dueAt: { type: Date, required: true },
    meetingAt: Date,
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: FOLLOW_UP_STATUSES, default: 'pending' },
    notes: { type: String, maxlength: 3000, default: '' },
    meetingNotes: { type: String, maxlength: 3000, default: '' },
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rescheduledFrom: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
)

followUpSchema.index({ organization: 1, status: 1, dueAt: 1 })
followUpSchema.index({ organization: 1, assignedTo: 1, status: 1, dueAt: 1 })
followUpSchema.index({ organization: 1, lead: 1, dueAt: -1 })
followUpSchema.index({ organization: 1, type: 1, meetingAt: 1 })

export const FollowUp = mongoose.model('FollowUp', followUpSchema)
