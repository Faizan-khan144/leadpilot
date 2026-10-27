export const ROLES = Object.freeze(['owner', 'manager', 'lead_generator'])

export const ROLE_LABELS = Object.freeze({
  owner: 'Owner / Admin',
  manager: 'Sales Manager',
  lead_generator: 'Lead Generator',
})

export const LEAD_STATUSES = Object.freeze([
  'New Lead',
  'Contacted',
  'Interested',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
])

export const PIPELINE_STATUSES = Object.freeze([
  'New Lead',
  'Contacted',
  'Interested',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
])

export const LEAD_SOURCES = Object.freeze([
  'Google Maps',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'Referral',
  'Manual',
  'Other',
])

export const PRIORITIES = Object.freeze(['low', 'medium', 'high', 'urgent'])

export const CALL_OUTCOMES = Object.freeze([
  'No Answer',
  'Busy',
  'Not Interested',
  'Interested',
  'Call Back Later',
  'Meeting Requested',
  'Wrong Number',
])

export const ANSWERED_OUTCOMES = Object.freeze([
  'Busy',
  'Not Interested',
  'Interested',
  'Call Back Later',
  'Meeting Requested',
  'Wrong Number',
])

export const INTERESTED_OUTCOMES = Object.freeze(['Interested', 'Meeting Requested'])

export const FOLLOW_UP_STATUSES = Object.freeze(['pending', 'completed', 'cancelled'])

export const FOLLOW_UP_TYPES = Object.freeze(['follow_up', 'meeting'])

export const DEAL_STATUSES = Object.freeze(['open', 'won', 'lost'])

export const PAYMENT_METHODS = Object.freeze([
  'bank_transfer',
  'upi',
  'cash',
  'card',
  'cheque',
  'other',
])

export const COMMISSION_STATUSES = Object.freeze([
  'pending',
  'partially_approved',
  'approved',
  'paid',
])

export const COMMISSION_BASES = Object.freeze(['deal_value', 'payments_received'])

export const DEFAULT_COMMISSION_RULES = Object.freeze([
  { minPaise: 0, maxPaise: 5_000_000, ratePercent: 15 },
  { minPaise: 5_000_000, maxPaise: 8_000_000, ratePercent: 25 },
  { minPaise: 8_000_000, maxPaise: null, ratePercent: 35 },
])

export const DEFAULT_COMMISSION_BASIS = 'deal_value'
export const DEFAULT_CURRENCY = 'INR'
export const DEFAULT_TIMEZONE = 'Asia/Kolkata'

export const NOTIFICATION_TYPES = Object.freeze([
  'follow_up',
  'meeting',
  'deal',
  'commission',
  'invitation',
  'system',
])

export const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  ORGANIZATION_UPDATED: 'organization.updated',
  COMMISSION_RULES_UPDATED: 'organization.commission_rules_updated',
  MEMBER_INVITED: 'member.invited',
  MEMBER_UPDATED: 'member.updated',
  MEMBER_DEACTIVATED: 'member.deactivated',
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  LEAD_ASSIGNED: 'lead.assigned',
  LEAD_STAGE_CHANGED: 'lead.stage_changed',
  CALL_LOGGED: 'call.logged',
  FOLLOW_UP_COMPLETED: 'follow_up.completed',
  FOLLOW_UP_RESCHEDULED: 'follow_up.rescheduled',
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  PAYMENT_RECORDED: 'payment.recorded',
  COMMISSION_APPROVED: 'commission.approved',
  COMMISSION_PAID: 'commission.paid',
})
