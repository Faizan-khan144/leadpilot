import { ApiError } from './ApiError.js'

export const getPagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20))
  return { page, limit, skip: (page - 1) * limit }
}

export const paginatedResponse = ({ items, total, page, limit }) => ({
  items,
  pagination: {
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrevious: page > 1,
  },
})

export const getSort = (query = {}, allowed, fallback = '-createdAt') => {
  const requested = String(query.sort || fallback)
  const direction = requested.startsWith('-') ? -1 : 1
  const field = requested.replace(/^-/, '')
  if (!allowed.includes(field)) {
    throw ApiError.badRequest(`Cannot sort by ${field}`)
  }
  return { [field]: direction }
}

export const escapeRegex = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
