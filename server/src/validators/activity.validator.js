import { z } from 'zod'
import {
  CALL_OUTCOMES,
  FOLLOW_UP_TYPES,
  PRIORITIES,
} from '../config/constants.js'
import {
  dateRangeSchema,
  nonNegativeInt,
  objectIdSchema,
  optionalDate,
  optionalText,
  paginationSchema,
} from './common.js'

export const createCallSchema = z.object({
  lead: objectIdSchema,
  calledAt: z.coerce.date().optional().default(() => new Date()),
  outcome: z.enum(CALL_OUTCOMES),
  durationSeconds: nonNegativeInt.optional().nullable(),
  notes: optionalText(3000),
  nextAction: optionalText(500),
  followUpAt: optionalDate,
})

export const callListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    lead: objectIdSchema.optional(),
    user: objectIdSchema.optional(),
    outcome: z.enum(CALL_OUTCOMES).optional(),
  })

export const createFollowUpSchema = z.object({
  lead: objectIdSchema,
  assignedTo: objectIdSchema,
  type: z.enum(FOLLOW_UP_TYPES).optional().default('follow_up'),
  dueAt: z.coerce.date(),
  meetingAt: optionalDate,
  priority: z.enum(PRIORITIES).optional().default('medium'),
  notes: optionalText(3000),
})

export const updateFollowUpSchema = z.object({
  dueAt: z.coerce.date(),
  reason: optionalText(1000),
})

export const completeFollowUpSchema = z.object({
  meetingNotes: optionalText(3000),
})

export const followUpListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    view: z
      .enum(['today', 'overdue', 'upcoming', 'completed', 'all'])
      .optional()
      .default('all'),
    assignedTo: objectIdSchema.optional(),
    lead: objectIdSchema.optional(),
    type: z.enum(FOLLOW_UP_TYPES).optional(),
    priority: z.enum(PRIORITIES).optional(),
  })
