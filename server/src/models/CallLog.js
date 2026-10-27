import mongoose from 'mongoose'
import { CALL_OUTCOMES } from '../config/constants.js'

const callLogSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calledAt: { type: Date, required: true, default: Date.now },
    outcome: { type: String, enum: CALL_OUTCOMES, required: true },
    durationSeconds: { type: Number, min: 0, max: 86_400, default: null },
    notes: { type: String, maxlength: 3000, default: '' },
    nextAction: { type: String, maxlength: 500, default: '' },
    followUpAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
)

callLogSchema.index({ organization: 1, calledAt: -1 })
callLogSchema.index({ organization: 1, lead: 1, calledAt: -1 })
callLogSchema.index({ organization: 1, user: 1, calledAt: -1 })
callLogSchema.index({ organization: 1, outcome: 1 })

export const CallLog = mongoose.model('CallLog', callLogSchema)
