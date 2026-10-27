import { z } from 'zod'

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid identifier')

export const optionalObjectId = z
  .union([objectIdSchema, z.literal(''), z.null()])
  .optional()
  .transform((value) => (value === '' ? null : value))

export const optionalText = (max = 2000) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional()

export const optionalEmail = z
  .union([z.string().trim().email('Enter a valid email address'), z.literal('')])
  .optional()
  .transform((value) => value || '')

export const optionalUrl = z
  .union([z.string().trim().url('Enter a valid URL'), z.literal('')])
  .optional()
  .transform((value) => value || '')

export const optionalDate = z.coerce.date().optional().nullable()

export const nonNegativeInt = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER)

export const positiveInt = z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER)

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

export const emptyToNull = (value) => (value === '' ? null : value)
