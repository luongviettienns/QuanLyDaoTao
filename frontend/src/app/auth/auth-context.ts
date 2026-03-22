import { createContext, useContext } from 'react'
import type { AuthUser, LoginPayload } from './auth-types'
import type { AppRole } from './roles'

export type AuthContextValue = {
  isAuthenticated: boolean
  isBootstrapping: boolean
  isSubmitting: boolean
  role: AppRole | null
  user: AuthUser | null
  accessToken: string | null
  error: string | null
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  /** Mutex refresh; used by api-client on 401 */
  refreshAccessToken: () => Promise<string | null>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
