import mongoose from 'mongoose'
import {
  COMMISSION_BASES,
  DEFAULT_COMMISSION_BASIS,
  DEFAULT_COMMISSION_RULES,
  DEFAULT_CURRENCY,
  DEFAULT_TIMEZONE,
} from '../config/constants.js'

const commissionRuleSchema = new mongoose.Schema(
  {
    minPaise: { type: Number, required: true, min: 0, max: Number.MAX_SAFE_INTEGER },
    maxPaise: { type: Number, default: null, min: 0, max: Number.MAX_SAFE_INTEGER },
    ratePercent: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
)

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, default: DEFAULT_CURRENCY, uppercase: true, maxlength: 3 },
    timezone: { type: String, default: DEFAULT_TIMEZONE },
    commissionBasis: {
      type: String,
      enum: COMMISSION_BASES,
      default: DEFAULT_COMMISSION_BASIS,
    },
    commissionRules: {
      type: [commissionRuleSchema],
      default: () => DEFAULT_COMMISSION_RULES.map((rule) => ({ ...rule })),
    },
    approvalRequired: { type: Boolean, default: true },
    paymentPolicyNotes: {
      type: String,
      default:
        'Commission is calculated from the deal amount. Releaseable commission grows with recorded payments and requires owner approval before payout.',
      maxlength: 1000,
    },
    deactivatedAt: Date,
  },
  { timestamps: true, versionKey: false },
)

organizationSchema.index({ owner: 1 })

export const Organization = mongoose.model('Organization', organizationSchema)
