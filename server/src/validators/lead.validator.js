import { z } from 'zod'
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PRIORITIES,
} from '../config/constants.js'
import {
  dateRangeSchema,
  nonNegativeInt,
  objectIdSchema,
  optionalDate,
  optionalEmail,
  optionalObjectId,
  optionalText,
  optionalUrl,
  paginationSchema,
} from './common.js'

const leadFields = {
  businessName: z.string().trim().min(2, 'Business name is required').max(160),
  contactPerson: z.string().trim().max(120).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  email: optionalEmail,
  website: optionalUrl,
  industry: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  country: z.string().trim().max(100).optional().default('India'),
  source: z.enum(LEAD_SOURCES).optional().default('Manual'),
  assignedTo: optionalObjectId,
  estimatedValuePaise: nonNegativeInt.optional().default(0),
  status: z.enum(LEAD_STATUSES).optional().default('New Lead'),
  priority: z.enum(PRIORITIES).optional().default('medium'),
  notes: optionalText(5000),
  nextFollowUpAt: optionalDate,
}

export const createLeadSchema = z.object(leadFields)

export const updateLeadSchema = z
  .object(leadFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  })

export const updateLeadStageSchema = z
  .object({
    status: z.enum(LEAD_STATUSES),
    lostReason: optionalText(1000),
  })
  .refine((value) => value.status !== 'Lost' || Boolean(value.lostReason?.trim()), {
    message: 'A lost reason is required when marking a lead as lost',
    path: ['lostReason'],
  })

export const bulkAssignSchema = z.object({
  leadIds: z.array(objectIdSchema).min(1, 'Select at least one lead').max(200),
  assignedTo: objectIdSchema,
})

export const leadListQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    search: z.string().trim().max(200).optional().default(''),
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    assignedTo: objectIdSchema.optional(),
    sort: z
      .enum([
        '-createdAt',
        'createdAt',
        '-estimatedValuePaise',
        'estimatedValuePaise',
        'businessName',
        '-businessName',
        '-nextFollowUpAt',
        'nextFollowUpAt',
      ])
      .optional()
      .default('-createdAt'),
  })

const csvLeadSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required').max(160),
  contactPerson: z.string().trim().max(120).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  email: z
    .union([z.string().trim().email('Invalid email'), z.literal('')])
    .optional()
    .default(''),
  website: z.string().trim().max(300).optional().default(''),
  industry: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  country: z.string().trim().max(100).optional().default('India'),
  source: z.enum(LEAD_SOURCES).optional().default('Manual'),
  assignedToEmail: z
    .union([z.string().trim().email('Invalid assignee email'), z.literal('')])
    .optional()
    .default(''),
  estimatedValuePaise: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(LEAD_STATUSES).optional().default('New Lead'),
  priority: z.enum(PRIORITIES).optional().default('medium'),
  notes: z.string().max(5000).optional().default(''),
})

export const importLeadsSchema = z.object({
  rows: z.array(csvLeadSchema).min(1, 'CSV must contain at least one row').max(1000),
  skipDuplicates: z.boolean().optional().default(true),
})

export const leadIdParamSchema = z.object({
  id: objectIdSchema,
})

export const pipelineBoardQuerySchema = z.object({
  search: z.string().trim().max(200).optional().default(''),
  priority: z.enum(PRIORITIES).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  assignedTo: objectIdSchema.optional(),
})
