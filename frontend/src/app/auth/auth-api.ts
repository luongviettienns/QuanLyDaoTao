export type AuthUser =
  | {
      id: string
      username: string
      email: string
      fullName: string
      role: { id: string; name: string }
      profile: { type: 'admin' }
    }
  | {
      id: string
      username: string
      email: string
      fullName: string
      role: { id: string; name: string }
      profile:
        | { type: 'lecturer'; lecturerId: string; lecturerCode: string }
        | { type: 'advisor'; lecturerId: string; lecturerCode: string }
        | { type: 'student'; studentId: string; studentCode: string }
    }

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

export type LoginPayload = {
  identifier: string
  password: string
  rememberMe?: boolean
}

export type LoginResult = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:4000/api/v1'

export class ApiError extends Error {
  public readonly code?: string
  public readonly status?: number

  constructor(
    message: string,
    code?: string,
    status?: number,
  ) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as SuccessEnvelope<T> | ErrorEnvelope

  if (!response.ok || payload.success === false) {
    const message = 'message' in payload ? payload.message : 'Yeu cau that bai.'
    const code = 'code' in payload ? payload.code : undefined
    throw new ApiError(message, code, response.status)
  }

  return payload.data
}

export async function loginApi(input: LoginPayload): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  return parseResponse<LoginResult>(response)
}

export async function getMeApi(accessToken: string): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseResponse<{ user: AuthUser }>(response)
}

export type RefreshAccessTokenResult = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

/** Làm mới JWT (cookie refresh). Không dùng authorizedFetch để tránh vòng lặp. */
export async function refreshAccessTokenApi(): Promise<RefreshAccessTokenResult> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  return parseResponse<RefreshAccessTokenResult>(response)
}
