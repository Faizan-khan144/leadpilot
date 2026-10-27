import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const standard = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down and try again shortly.' },
}

export const rateLimiter = rateLimit({
  ...standard,
  windowMs: env.rateLimitWindowMinutes * 60 * 1000,
  max: env.rateLimitMax,
  skip: () => env.nodeEnv === 'test',
})

export const authLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'test' ? 10_000 : 30,
  skipSuccessfulRequests: true,
})
