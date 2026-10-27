import mongoose from 'mongoose'
import { DEAL_STATUSES } from '../config/constants.js'

const commissionSnapshotSchema = new mongoose.Schema(
  {
    basis: { type: String, enum: ['deal_value', 'payments_received'], required: true },
    ratePercent: { type: Number, required: true, min: 0, max: 100 },
    calculatedCommissionPaise: { type: Number, required: true, min: 0 },
    rulesVersion: { type: String, default: 'captured-at-deal-creation' },
    capturedAt: { type: Date, required: true },
  },
  { _id: false },
)

const dealSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    businessName: { type: String, required: true, trim: true, maxlength: 160 },
    contactPerson: { type: String, trim: true, maxlength: 120, default: '' },
    amountPaise: { type: Number, required: true, min: 0, max: Number.MAX_SAFE_INTEGER },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: DEAL_STATUSES, default: 'open' },
    proposalDate: Date,
    expectedClosingDate: Date,
    actualClosingDate: Date,
    lostReason: { type: String, maxlength: 1000, default: '' },
    notes: { type: String, maxlength: 5000, default: '' },
    commissionSnapshot: { type: commissionSnapshotSchema, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
)

dealSchema.index({ organization: 1, status: 1, createdAt: -1 })
dealSchema.index({ organization: 1, assignedTo: 1, status: 1 })
dealSchema.index({ organization: 1, lead: 1 })
dealSchema.index({ organization: 1, actualClosingDate: -1 })

export const Deal = mongoose.model('Deal', dealSchema)
