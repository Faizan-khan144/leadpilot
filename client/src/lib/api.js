const API_BASE = import.meta.env.VITE_API_URL || '/api'
const ORGANIZATION_KEY = 'leadpilot_active_organization'

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const getStoredOrganizationId = () => localStorage.getItem(ORGANIZATION_KEY)

export const setStoredOrganizationId = (id) => {
  if (id) localStorage.setItem(ORGANIZATION_KEY, id)
  else localStorage.removeItem(ORGANIZATION_KEY)
}

let organizationId = getStoredOrganizationId()

export const setApiOrganization = (id) => {
  organizationId = id || null
  setStoredOrganizationId(id)
}

const parseResponse = async (response) => {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {})
  const isForm = options.body instanceof FormData

  if (options.body && !isForm && typeof options.body !== 'string') {
    headers.set('Content-Type', 'application/json')
  }
  if (organizationId) headers.set('x-organization-id', organizationId)

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body:
      options.body && !isForm && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('leadpilot:unauthorized'))
    }
    const fallback =
      response.status === 429
        ? 'Too many attempts. Please wait a moment and try again.'
        : response.status >= 500
          ? 'Something went wrong on our side. Please try again.'
          : 'Request failed.'
    throw new ApiError(data?.message || fallback, response.status, data)
  }

  return data
}

const withQuery = (path, query) => {
  if (!query) return path
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  })
  const string = params.toString()
  return string ? `${path}?${string}` : path
}

export const api = {
  get: (path, query) => apiRequest(withQuery(path, query)),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
  download: async (path, query) => {
    const headers = new Headers()
    if (organizationId) headers.set('x-organization-id', organizationId)
    const response = await fetch(`${API_BASE}${withQuery(path, query)}`, {
      headers,
      credentials: 'include',
    })
    if (!response.ok) {
      const data = await parseResponse(response)
      throw new ApiError(data?.message || 'Download failed', response.status, data)
    }
    return response.blob()
  },
}
