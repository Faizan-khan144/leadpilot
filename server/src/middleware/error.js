import { ApiError } from '../utils/ApiError.js'

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} was not found`))
}

export const errorHandler = (error, req, res, _next) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Something went wrong'
  let details = error.details || null
  let code = error.code

  if (error.name === 'ZodError') {
    statusCode = 422
    message = 'Please check the highlighted fields.'
    details = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
  }

  if (error.name === 'ValidationError' && error.errors) {
    statusCode = 422
    message = 'Some fields are invalid.'
    details = Object.values(error.errors).map((entry) => ({
      field: entry.path,
      message: entry.message,
    }))
  }

  if (error.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${error.path || 'identifier'}`
  }

  if (error.code === 11000) {
    statusCode = 409
    message = 'A record with these details already exists.'
    details = error.keyValue || null
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Your session has expired. Please sign in again.'
  }

  if (statusCode >= 500) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[${req.method} ${req.originalUrl}]`, error)
    }
    message = 'An unexpected server error occurred.'
    details = null
  }

  res.status(statusCode).json({
    message,
    ...(code && typeof code === 'string' ? { code } : {}),
    ...(details ? { details } : {}),
  })
}
