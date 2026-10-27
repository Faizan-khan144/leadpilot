import { z } from 'zod'
import { ROLES } from '../config/constants.js'
import {
  dateRangeSchema,
  objectIdSchema,
  optionalText,
  paginationSchema,
} from './common.js'

export const updateOrganizationSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    timezone: z.string().trim().min(2).max(80).optional(),
    currency: z.string().trim().length(3).toUpperCase().optional(),
    paymentPolicyNotes: optionalText(1000),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  })

export const updateMemberSchema = z
  .object({
    role: z.enum(ROLES).refine((role) => role !== 'owner').optional(),
    managerId: objectIdSchema.optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  })

export const memberListQuerySchema = paginationSchema.extend({
  role: z.enum(ROLES).optional(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  search: z.string().trim().max(200).optional().default(''),
})

export const analyticsQuerySchema = dateRangeSchema.extend({
  assignedTo: objectIdSchema.optional(),
})

export const reportQuerySchema = dateRangeSchema.extend({
  format: z.enum(['json', 'csv']).optional().default('json'),
})

export const notificationListQuerySchema = paginationSchema.extend({
  unreadOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => value === true || value === 'true'),
})

export const notificationIdParamSchema = z.object({
  id: objectIdSchema,
})

export const memberIdParamSchema = z.object({
  id: objectIdSchema,
})
