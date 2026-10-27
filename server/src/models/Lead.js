import mongoose from 'mongoose'
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PRIORITIES,
} from '../config/constants.js'

const leadSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true, maxlength: 160 },
    contactPerson: { type: String, trim: true, maxlength: 120, default: '' },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    email: { type: String, lowercase: true, trim: true, maxlength: 160, default: '' },
    website: { type: String, trim: true, maxlength: 300, default: '' },
    industry: { type: String, trim: true, maxlength: 100, default: '' },
    city: { type: String, trim: true, maxlength: 100, default: '' },
    country: { type: String, trim: true, maxlength: 100, default: 'India' },
    source: { type: String, enum: LEAD_SOURCES, default: 'Manual' },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    estimatedValuePaise: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: LEAD_STATUSES, default: 'New Lead' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    notes: { type: String, maxlength: 5000, default: '' },
    lastContactedAt: Date,
    nextFollowUpAt: Date,
    lostReason: { type: String, maxlength: 1000, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
)

leadSchema.index({ organization: 1, status: 1, createdAt: -1 })
leadSchema.index({ organization: 1, assignedTo: 1, status: 1 })
leadSchema.index({ organization: 1, nextFollowUpAt: 1 })
leadSchema.index({ organization: 1, priority: 1 })
leadSchema.index({ organization: 1, businessName: 1 })
leadSchema.index({ organization: 1, phone: 1 })
leadSchema.index({ organization: 1, email: 1 })

export const Lead = mongoose.model('Lead', leadSchema)
