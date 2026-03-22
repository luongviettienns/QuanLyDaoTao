export function successResponse<T>(message: string, data: T) {
  return {
    success: true,
    message,
    data,
  }
}

export function errorResponse(message: string, code: string, details?: unknown) {
  return {
    success: false,
    message,
    code,
    ...(details !== undefined ? { details } : {}),
  }
}
