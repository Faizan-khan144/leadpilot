import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => twMerge(clsx(inputs))

export const titleCase = (value = '') =>
  String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'LP'

export const formatMoney = (paise = 0, { compact = false } = {}) => {
  const amount = Number(paise || 0) / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(amount)
}

export const formatNumber = (value = 0, options = {}) =>
  new Intl.NumberFormat('en-IN', options).format(Number(value || 0))

export const formatDate = (value, options = {}) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const toDateTimeLocal = (value) => {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16)
}

export const timeAgo = (value) => {
  if (!value) return ''
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, amount] of ranges) {
    if (Math.abs(seconds) >= amount) {
      return formatter.format(Math.round(seconds / amount), unit)
    }
  }
  return 'just now'
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const parseCsv = (text) => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]

    if (character === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (field || row.length) {
    row.push(field)
    if (row.some((value) => value.trim() !== '')) rows.push(row)
  }

  if (rows.length < 2) return []
  const headers = rows[0].map((header) => header.trim())
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])),
  )
}

export const priorityTone = {
  low: 'badge-muted',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-danger',
}

export const leadStatusTone = {
  'New Lead': 'badge-muted',
  Contacted: 'badge-info',
  Interested: 'badge-accent',
  'Meeting Scheduled': 'badge-warning',
  'Proposal Sent': 'badge-info',
  Negotiation: 'badge-warning',
  Won: 'badge-success',
  Lost: 'badge-danger',
}

export const dealStatusTone = {
  open: 'badge-info',
  won: 'badge-success',
  lost: 'badge-danger',
}

export const commissionStatusTone = {
  pending: 'badge-warning',
  partially_approved: 'badge-info',
  approved: 'badge-accent',
  paid: 'badge-success',
}
