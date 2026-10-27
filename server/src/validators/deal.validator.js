import { z } from 'zod'
import {
  COMMISSION_BASES,
  DEAL_STATUSES,
  PAYMENT_METHODS,
} from '../config/constants.js'
import {
  dateRangeSchema,
  nonNegativeInt,
  objectIdSchema,
  optionalDate,
  optionalObjectId,
  optionalText,
  paginationSchema,
  positiveInt,
} from './common.js'

export const createDealSchema = z.object({
  lead: objectIdSchema,
  amountPaise: positiveInt,
  assignedTo: optionalObjectId,
  proposalDate: optionalDate,
  expectedClosingDate: optionalDate,
  notes: optionalText(5000),
})

export const updateDealSchema = z
  .object({
    amountPaise: positiveInt.optional(),
    assignedTo: objectIdSchema.optional(),
    proposalDate: optionalDate,
    expectedClosingDate: optionalDate,
    actualClosingDate: optionalDate,
    notes: optionalText(5000),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  })

export const updateDealStatusSchema = z
  .object({
    status: z.enum(DEAL_STATUSES),
    lostReason: optionalText(1000),
    actualClosingDate: optionalDate,
  })
  .refine((value) => value.status !== 'lost' || Boolean(value.lostReason?.trim()), {
    message: 'A lost reason is required',
    path: ['lostReason'],
  })

export const dealListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    status: z.enum(DEAL_STATUSES).optional(),
    assignedTo: objectIdSchema.optional(),
    lead: objectIdSchema.optional(),
    search: z.string().trim().max(200).optional().default(''),
  })

export const createPaymentSchema = z.object({
  deal: objectIdSchema,
  amountPaise: positiveInt,
  method: z.enum(PAYMENT_METHODS),
  receivedAt: z.coerce.date().optional().default(() => new Date()),
  reference: optionalText(160),
  notes: optionalText(2000),
})

export const paymentListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    deal: objectIdSchema.optional(),
    method: z.enum(PAYMENT_METHODS).optional(),
  })

export const approveCommissionSchema = z.object({
  amountPaise: positiveInt,
  note: optionalText(1000),
})

export const payoutCommissionSchema = z.object({
  amountPaise: positiveInt,
  method: z.string().trim().max(60).optional().default('manual'),
  reference: optionalText(160),
  note: optionalText(1000),
  paidAt: z.coerce.date().optional().default(() => new Date()),
})

export const commissionRulesSchema = z
  .object({
    commissionBasis: z.enum(COMMISSION_BASES),
    approvalRequired: z.boolean().optional(),
    commissionRules: z
      .array(
        z
          .object({
            minPaise: nonNegativeInt,
            maxPaise: nonNegativeInt.nullable(),
            ratePercent: z.coerce.number().min(0).max(100),
          })
          .refine(
            (rule) =>
              rule.maxPaise === null || Number(rule.maxPaise) > Number(rule.minPaise),
            { message: 'Maximum must be greater than minimum', path: ['maxPaise'] },
          ),
      )
      .min(1, 'At least one commission band is required')
      .max(20),
    paymentPolicyNotes: optionalText(1000),
  })
  .refine(
    (value) => {
      const sorted = [...value.commissionRules].sort((a, b) => a.minPaise - b.minPaise)
      return sorted.every((rule, index) => {
        if (index === 0) return rule.minPaise === 0
        return sorted[index - 1].maxPaise === rule.minPaise
      })
    },
    { message: 'Commission bands must be continuous and start at zero', path: ['commissionRules'] },
  )
