import crypto from 'crypto'
import { Membership } from '../models/Membership.js'
import { Organization } from '../models/Organization.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'
import { buildClientUrl, sendEmail } from '../utils/email.js'
import { createRandomToken, hashToken, setAuthCookie, signAuthToken } from '../utils/tokens.js'
import { logActivity } from './activity.service.js'
import { createNotification } from './notification.service.js'

export const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'organization'

const uniqueSlug = async (name) => {
  const base = slugify(name)
  let slug = base
  let attempts = 0
  while (await Organization.exists({ slug })) {
    attempts += 1
    slug = `${base}-${crypto.randomInt(1000, 9999)}`
    if (attempts > 8) slug = `${base}-${Date.now().toString(36)}`
  }
  return slug
}

export const serializeSession = async (user) => {
  const memberships = await Membership.find({
    user: user._id,
    status: 'active',
  }).populate('organization')

  const organizations = memberships
    .filter((membership) => membership.organization?.deactivatedAt == null)
    .map((membership) => ({
      id: membership.organization._id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
      currency: membership.organization.currency,
      timezone: membership.organization.timezone,
    }))

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      lastLoginAt: user.lastLoginAt || null,
    },
    organizations,
    activeOrganization: organizations[0] || null,
  }
}

export const issueSession = async (res, user, options = {}) => {
  const token = signAuthToken(user._id)
  setAuthCookie(res, token, options)
  return serializeSession(user)
}

export const registerUser = async ({ name, email, password, organizationName }) => {
  const existing = await User.findOne({ email })
  if (existing) throw ApiError.conflict('An account with this email already exists.')

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    avatarColor: ['#8b5cf6', '#6366f1', '#d946ef', '#0ea5e9'][
      crypto.randomInt(0, 4)
    ],
  })

  const organization = await Organization.create({
    name: organizationName,
    slug: await uniqueSlug(organizationName),
    owner: user._id,
    timezone: 'Asia/Kolkata',
  })

  await Membership.create({
    user: user._id,
    organization: organization._id,
    role: 'owner',
    status: 'active',
    joinedAt: new Date(),
  })

  return user
}

export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) throw ApiError.unauthorized('Invalid email or password.')

  const valid = await user.comparePassword(password)
  if (!valid) throw ApiError.unauthorized('Invalid email or password.')

  user.lastLoginAt = new Date()
  await user.save({ validateBeforeSave: false })
  return user
}

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email })
  if (!user) return { devResetToken: null }

  const token = createRandomToken()
  user.passwordResetTokenHash = hashToken(token)
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await user.save({ validateBeforeSave: false })

  const resetUrl = buildClientUrl(`/reset-password?token=${token}`)
  await sendEmail({
    to: user.email,
    subject: 'Reset your LeadPilot password',
    text: `Reset your password within one hour: ${resetUrl}`,
    html: `<p>Reset your LeadPilot password within one hour.</p><p><a href="${resetUrl}">Choose a new password</a></p>`,
  })

  return { devResetToken: env.nodeEnv === 'production' ? null : token }
}

export const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash')

  if (!user) {
    throw ApiError.badRequest('This reset link is invalid or has expired.')
  }

  user.passwordHash = password
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  await user.save()

  return user
}

export const previewInvitation = async (token) => {
  const membership = await Membership.findOne({
    inviteTokenHash: hashToken(token),
    status: 'pending',
    inviteExpiresAt: { $gt: new Date() },
  }).populate('organization', 'name slug')

  if (!membership) {
    throw ApiError.notFound('This invitation is invalid or has expired.')
  }

  const hasAccount = Boolean(await User.exists({ email: membership.invitedEmail }))
  return {
    email: membership.invitedEmail,
    role: membership.role,
    organization: {
      name: membership.organization.name,
      slug: membership.organization.slug,
    },
    hasAccount,
  }
}

export const acceptInvitation = async ({ token, name, password }) => {
  const membership = await Membership.findOne({
    inviteTokenHash: hashToken(token),
    status: 'pending',
    inviteExpiresAt: { $gt: new Date() },
  }).populate('organization')

  if (!membership) {
    throw ApiError.notFound('This invitation is invalid or has expired.')
  }

  const email = membership.invitedEmail
  let user = await User.findOne({ email }).select('+passwordHash')

  if (user) {
    const valid = password ? await user.comparePassword(password) : false
    if (!valid) {
      throw ApiError.unauthorized(
        'An account already exists for this email. Sign in first, then accept the invitation.',
      )
    }
  } else {
    if (!password) {
      throw ApiError.badRequest('Create a password to accept this invitation.')
    }
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      passwordHash: password,
    })
  }

  membership.user = user._id
  membership.status = 'active'
  membership.joinedAt = new Date()
  membership.inviteTokenHash = undefined
  membership.inviteExpiresAt = undefined
  await membership.save()

  await logActivity({
    organization: membership.organization._id,
    actor: user._id,
    type: 'member.joined',
    message: `${user.name} joined the organization.`,
  })

  await createNotification({
    organization: membership.organization._id,
    user: membership.organization.owner,
    type: 'invitation',
    title: 'Invitation accepted',
    message: `${user.name} joined ${membership.organization.name}.`,
    link: '/team',
    dedupeKey: `invite-accepted-${membership._id}`,
  })

  return user
}
