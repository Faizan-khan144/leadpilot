import mongoose from 'mongoose'
import { ROLES } from '../config/constants.js'

const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    invitedEmail: { type: String, lowercase: true, trim: true, maxlength: 160 },
    invitedName: { type: String, trim: true, maxlength: 80, default: '' },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: { type: String, enum: ROLES, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'active',
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inviteTokenHash: { type: String, select: false },
    inviteExpiresAt: { type: Date, select: false },
    joinedAt: Date,
    deactivatedAt: Date,
  },
  { timestamps: true, versionKey: false },
)

membershipSchema.index(
  { organization: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } },
)
membershipSchema.index(
  { organization: 1, invitedEmail: 1 },
  { unique: true, partialFilterExpression: { invitedEmail: { $type: 'string' } } },
)
membershipSchema.index({ organization: 1, status: 1, role: 1 })
membershipSchema.index({ organization: 1, manager: 1 })
membershipSchema.index({ inviteTokenHash: 1 })

membershipSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.inviteTokenHash
    delete ret.inviteExpiresAt
    return ret
  },
})

export const Membership = mongoose.model('Membership', membershipSchema)
