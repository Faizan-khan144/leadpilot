import mongoose from 'mongoose'
import { COMMISSION_STATUSES } from '../config/constants.js'

const approvalSchema = new mongoose.Schema(
  {
    amountPaise: { type: Number, required: true, min: 1 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedAt: { type: Date, required: true, default: Date.now },
    note: { type: String, maxlength: 1000, default: '' },
  },
  { _id: true },
)

const payoutSchema = new mongoose.Schema(
  {
    amountPaise: { type: Number, required: true, min: 1 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paidAt: { type: Date, required: true, default: Date.now },
    method: { type: String, maxlength: 60, default: 'manual' },
    reference: { type: String, maxlength: 160, default: '' },
    note: { type: String, maxlength: 1000, default: '' },
  },
  { _id: true },
)

const commissionSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basis: { type: String, enum: ['deal_value', 'payments_received'], required: true },
    dealAmountPaise: { type: Number, required: true, min: 0 },
    ratePercent: { type: Number, required: true, min: 0, max: 100 },
    calculatedCommissionPaise: { type: Number, required: true, min: 0 },
    receivedPaise: { type: Number, default: 0, min: 0 },
    earnedCommissionPaise: { type: Number, default: 0, min: 0 },
    pendingCommissionPaise: { type: Number, default: 0, min: 0 },
    approvedCommissionPaise: { type: Number, default: 0, min: 0 },
    paidCommissionPaise: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: COMMISSION_STATUSES, default: 'pending' },
    approvals: { type: [approvalSchema], default: [] },
    payouts: { type: [payoutSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
)

commissionSchema.index({ organization: 1, member: 1, createdAt: -1 })
commissionSchema.index({ organization: 1, status: 1 })
commissionSchema.index({ organization: 1, deal: 1 }, { unique: true })

commissionSchema.virtual('payableCommissionPaise').get(function payable() {
  return Math.max(0, this.approvedCommissionPaise - this.paidCommissionPaise)
})

commissionSchema.set('toJSON', { virtuals: true })

export const Commission = mongoose.model('Commission', commissionSchema)
