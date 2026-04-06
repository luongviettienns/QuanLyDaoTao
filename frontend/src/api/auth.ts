import type { LoginApiEnvelope, LoginPayload, LoginResponse } from '../types/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'https://localhost:7033'

const LOGIN_ENDPOINT = `${API_BASE_URL}/api-edu/auth/login`

function extractErrorMessage(body: LoginApiEnvelope | { message?: string } | null) {
  if (body && 'message' in body && typeof body.message === 'string') {
    return body.message
  }

  return 'Dang nhap that bai. Vui long thu lai.'
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const rawBody = (await response.json().catch(() => null)) as
    | LoginApiEnvelope
    | { message?: string }
    | null

  if (!response.ok) {
    throw new Error(extractErrorMessage(rawBody))
  }

  if (!rawBody || !('data' in rawBody) || !rawBody.data?.token) {
    throw new Error('Phan hoi dang nhap khong hop le tu backend.')
  }

  return rawBody.data
}
