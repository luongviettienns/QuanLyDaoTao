import { ApiError, refreshAccessTokenApi } from '@/app/auth/auth-api'
import { getAccessTokenFromStorage, persistAccessToken } from '@/lib/auth-token-bridge'
import { emitSessionExpired } from '@/lib/session-expired'

let refreshChain: Promise<string | null> | null = null

async function refreshAccessTokenLocked(): Promise<string | null> {
  if (refreshChain) return refreshChain

  refreshChain = (async () => {
    try {
      const data = await refreshAccessTokenApi()
      persistAccessToken(data.accessToken)
      return data.accessToken
    } catch {
      return null
    } finally {
      refreshChain = null
    }
  })()

  return refreshChain
}

/**
 * Gọi API có Bearer token; nếu 401 thì thử POST /auth/refresh một lần rồi gọi lại.
 * Refresh thất bại → emit session expired (listener đưa về /login + toast).
 */
export async function authorizedFetch(input: string | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAccessTokenFromStorage()
  if (!token) {
    emitSessionExpired()
    throw new ApiError('Chưa đăng nhập.', 'UNAUTHORIZED', 401)
  }

  const buildHeaders = (accessToken: string) => {
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    if (init.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return headers
  }

  let response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(token),
  })

  if (response.status !== 401) {
    return response
  }

  const newToken = await refreshAccessTokenLocked()
  if (!newToken) {
    emitSessionExpired()
    throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'SESSION_EXPIRED', 401)
  }

  response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(newToken),
  })

  if (response.status === 401) {
    emitSessionExpired()
    throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'SESSION_EXPIRED', 401)
  }

  return response
}
