export const LEAD_STATUSES = [
  'New Lead',
  'Contacted',
  'Interested',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
]

export const PIPELINE_STAGES = LEAD_STATUSES.slice(0, 7)

export const LEAD_SOURCES = [
  'Google Maps',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'Referral',
  'Manual',
  'Other',
]

export const PRIORITIES = ['low', 'medium', 'high', 'urgent']

export const CALL_OUTCOMES = [
  'No Answer',
  'Busy',
  'Not Interested',
  'Interested',
  'Call Back Later',
  'Meeting Requested',
  'Wrong Number',
]

export const PAYMENT_METHODS = [
  'bank_transfer',
  'upi',
  'cash',
  'card',
  'cheque',
  'other',
]

export const DEAL_STATUSES = ['open', 'won', 'lost']

export const ROLES = [
  { value: 'owner', label: 'Owner / Admin' },
  { value: 'manager', label: 'Sales Manager' },
  { value: 'lead_generator', label: 'Lead Generator' },
]
