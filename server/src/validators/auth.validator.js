import { z } from 'zod'
import { ROLES } from '../config/constants.js'
import { objectIdSchema } from './common.js'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or fewer')
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/\d/, 'Password must include a number')

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: passwordSchema,
  organizationName: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(true),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Reset token is invalid'),
  password: passwordSchema,
})

export const acceptInviteSchema = z.object({
  token: z.string().min(20, 'Invitation token is invalid'),
  name: z.string().trim().min(2).max(80).optional(),
  password: passwordSchema.optional(),
  role: z.enum(ROLES).optional(),
})

export const inviteMemberSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    role: z.enum(ROLES).refine((role) => role !== 'owner', 'There can be only one owner'),
    name: z.string().trim().min(2).max(80).optional(),
    managerId: objectIdSchema.optional().nullable(),
  })
  .refine(
    (value) => value.role !== 'lead_generator' || Boolean(value.managerId),
    { message: 'Lead generators must have a manager', path: ['managerId'] },
  )
