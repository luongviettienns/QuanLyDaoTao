import type { AuthSession } from '../types/auth'

const STORAGE_KEY = 'edu-auth-session'

export function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.sessionStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthSession
  } catch {
    return null
  }
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
  window.sessionStorage.removeItem(STORAGE_KEY)
}

export function persistSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return
  }

  clearStoredSession()

  const storage = session.rememberMe ? window.localStorage : window.sessionStorage
  storage.setItem(STORAGE_KEY, JSON.stringify(session))
}
