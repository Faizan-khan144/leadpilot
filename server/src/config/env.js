import dotenv from 'dotenv'

dotenv.config()

const required = ['MONGODB_URI', 'JWT_SECRET']

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}

const numberFromEnv = (key, fallback) => {
  const parsed = Number(process.env[key])
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: numberFromEnv('PORT', 5200),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5201',
  mongoUri: process.env.MONGODB_URI,
  useMemoryDb: process.env.USE_MEMORY_DB === 'true',
  seedDemo: process.env.SEED_DEMO === 'true',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'leadpilot_token',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  bcryptRounds: numberFromEnv('BCRYPT_ROUNDS', 12),
  rateLimitWindowMinutes: numberFromEnv('RATE_LIMIT_WINDOW_MINUTES', 15),
  rateLimitMax: numberFromEnv('RATE_LIMIT_MAX', 300),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: numberFromEnv('SMTP_PORT', 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'LeadPilot <no-reply@leadpilot.local>',
  },
  seed: {
    ownerEmail: process.env.SEED_OWNER_EMAIL || 'owner@demo.leadpilot.test',
    ownerPassword: process.env.SEED_OWNER_PASSWORD || 'LeadPilot123!',
  },
}

export const isProduction = env.nodeEnv === 'production'
export const isTest = env.nodeEnv === 'test'
