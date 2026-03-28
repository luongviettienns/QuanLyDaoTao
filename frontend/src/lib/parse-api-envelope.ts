import { ApiError } from '@/app/auth/auth-api'

type SuccessEnvelope<T> = {
  success: true
  message: string
  data: T
}

type ErrorEnvelope = {
  success: false
  message: string
  code: string
  details?: unknown
}

export async function parseApiEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as SuccessEnvelope<T> | ErrorEnvelope

  if (!response.ok || payload.success === false) {
    const message = 'message' in payload ? payload.message : 'Yêu cầu thất bại.'
    const code = 'code' in payload ? payload.code : undefined
    throw new ApiError(message, code, response.status)
  }

  return payload.data
}
