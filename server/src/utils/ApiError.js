export class ApiError extends Error {
  constructor(statusCode, message, details = null, code = undefined) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details)
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message)
  }

  static conflict(message, details) {
    return new ApiError(409, message, details)
  }

  static unprocessable(message, details) {
    return new ApiError(422, message, details)
  }
}
