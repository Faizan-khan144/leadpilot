import { ANSWERED_OUTCOMES, INTERESTED_OUTCOMES } from '../config/constants.js'

export const isPrivileged = (membership) =>
  membership?.role === 'owner' || membership?.role === 'manager'

export const isOwner = (membership) => membership?.role === 'owner'

export const leadScope = (req) =>
  isPrivileged(req.membership) ? {} : { assignedTo: req.user._id }

export const dealScope = (req) =>
  isPrivileged(req.membership) ? {} : { assignedTo: req.user._id }

export const memberScope = (req) => {
  if (req.membership.role === 'owner') return {}
  return { manager: req.user._id }
}

export const commissionScope = (req) => {
  if (req.membership.role === 'owner') return {}
  if (req.membership.role === 'manager') {
    return { member: { $in: req.teamMemberIds || [] } }
  }
  return { member: req.user._id }
}

export const canAccessLead = (req, lead) =>
  isPrivileged(req.membership) || String(lead.assignedTo) === String(req.user._id)

export const callCountsAsAnswered = (outcome) => ANSWERED_OUTCOMES.includes(outcome)

export const callCountsAsInterested = (outcome) => INTERESTED_OUTCOMES.includes(outcome)
