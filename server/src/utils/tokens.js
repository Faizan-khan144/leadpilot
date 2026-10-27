import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from './ApiError.js'

export const signAuthToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'leadpilot',
    audience: 'leadpilot-web',
  })

export const verifyAuthToken = (token) =>
  jwt.verify(token, env.jwtSecret, {
    issuer: 'leadpilot',
    audience: 'leadpilot-web',
  })

export const setAuthCookie = (res, token, { remember = true } = {}) => {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
    path: '/',
  })
}

export const clearAuthCookie = (res) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/',
  })
}

export const createRandomToken = () => crypto.randomBytes(32).toString('hex')

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

export const expireMinutesFromNow = (minutes) =>
  new Date(Date.now() + minutes * 60 * 1000)

export const assertObjectId = (value, label = 'identifier') => {
  if (!/^[a-f\d]{24}$/i.test(String(value || ''))) {
    throw ApiError.badRequest(`Invalid ${label}`)
  }
}
