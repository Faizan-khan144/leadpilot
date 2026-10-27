import mongoose from 'mongoose'
import { PAYMENT_METHODS } from '../config/constants.js'

const paymentSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    amountPaise: { type: Number, required: true, min: 1, max: Number.MAX_SAFE_INTEGER },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    receivedAt: { type: Date, required: true, default: Date.now },
    reference: { type: String, trim: true, maxlength: 160, default: '' },
    notes: { type: String, maxlength: 2000, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
)

paymentSchema.index({ organization: 1, deal: 1, receivedAt: -1 })
paymentSchema.index({ organization: 1, receivedAt: -1 })
paymentSchema.index({ organization: 1, method: 1 })

export const Payment = mongoose.model('Payment', paymentSchema)
