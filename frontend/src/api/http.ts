import { clearStoredSession, readStoredSession } from '../auth/auth-storage'

type ApiEnvelope<T> = {
  data?: T
  message?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'https://localhost:7033'

export const apiBaseUrl = API_BASE_URL

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = readStoredSession()
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  const rawBody = (await response.json().catch(() => null)) as ApiEnvelope<T> | T | null

  if (response.status === 401) {
    clearStoredSession()
  }

  if (!response.ok) {
    const message =
      rawBody && typeof rawBody === 'object' && 'message' in rawBody && typeof rawBody.message === 'string'
        ? rawBody.message
        : 'Khong the tai du lieu tu he thong.'

    throw new Error(message)
  }

  if (rawBody && typeof rawBody === 'object' && 'data' in rawBody) {
    return rawBody.data as T
  }

  return rawBody as T
}
