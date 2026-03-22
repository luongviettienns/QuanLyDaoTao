import { appConfig } from '@/config/env'
import { getAccessTokenFromStore } from './access-token-store'
import { runAuthRefresh } from './auth-refresh-registry'

function joinUrl(path: string) {
  const base = appConfig.backendBaseUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function fetchWithToken(url: string, init: RequestInit, bearerToken: string | null) {
  const headers = new Headers(init.headers)
  if (bearerToken) {
    headers.set('Authorization', `Bearer ${bearerToken}`)
  }

  return fetch(url, { ...init, headers, credentials: 'include' })
}

/**
 * Authenticated fetch: sends Bearer token, cookies, retries once after refresh on 401.
 */
export async function apiClient(path: string, init: RequestInit = {}): Promise<Response> {
  const url = joinUrl(path)
  let res = await fetchWithToken(url, init, getAccessTokenFromStore())

  if (res.status === 401) {
    const newToken = await runAuthRefresh()
    if (newToken) {
      res = await fetchWithToken(url, init, newToken)
    }
  }

  return res
}
