import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env, isTest } from './config/env.js'
import { errorHandler, notFound } from './middleware/error.js'
import { rateLimiter } from './middleware/rateLimit.js'
import authRoutes from './routes/auth.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import memberRoutes from './routes/member.routes.js'
import leadRoutes from './routes/lead.routes.js'
import callRoutes from './routes/call.routes.js'
import followUpRoutes from './routes/followUp.routes.js'
import dealRoutes from './routes/deal.routes.js'
import commissionRoutes from './routes/commission.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import notificationRoutes from './routes/notification.routes.js'

export const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),
)
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      const clean = origin.replace(/\/$/, '')
      if (allowedOrigins.includes(clean)) return callback(null, true)
      return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
  }),
)
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))
if (!isTest) app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use('/api', rateLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'leadpilot-api', time: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/calls', callRoutes)
app.use('/api/follow-ups', followUpRoutes)
app.use('/api/deals', dealRoutes)
app.use('/api/commissions', commissionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)

app.use(notFound)
app.use(errorHandler)
