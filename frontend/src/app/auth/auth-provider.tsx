import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { fetchMe, loginWithPassword, postLogout, postLogoutAll, postRefresh } from './auth-api'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { AuthUser, LoginPayload } from './auth-types'
import { setAccessTokenStore } from '@/lib/access-token-store'
import { registerAuthRefresh } from '@/lib/auth-refresh-registry'

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshPromiseRef = useRef<Promise<string | null> | null>(null)
  const bootstrapOnceRef = useRef(false)

  const setToken = useCallback((token: string | null) => {
    setAccessTokenState(token)
    setAccessTokenStore(token)
  }, [])

  const clearAuthState = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [setToken])

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    const promise = (async () => {
      try {
        const result = await postRefresh()
        setToken(result.accessToken)
        return result.accessToken
      } catch {
        clearAuthState()
        return null
      } finally {
        refreshPromiseRef.current = null
      }
    })()

    refreshPromiseRef.current = promise
    return promise
  }, [clearAuthState, setToken])

  useEffect(() => {
    return registerAuthRefresh(refreshAccessToken)
  }, [refreshAccessToken])

  useEffect(() => {
    if (bootstrapOnceRef.current) {
      return
    }

    bootstrapOnceRef.current = true
    let cancelled = false

    ;(async () => {
      setIsBootstrapping(true)

      try {
        const refreshed = await refreshAccessToken()

        if (cancelled || !refreshed) {
          return
        }

        const me = await fetchMe(refreshed)

        if (cancelled) {
          return
        }

        setUser(me)
      } catch {
        if (!cancelled) {
          clearAuthState()
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clearAuthState, refreshAccessToken])

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await loginWithPassword(payload)
        setToken(result.accessToken)
        setUser(result.user)
        return result.user
      } catch (loginError) {
        const nextError = loginError instanceof Error ? loginError.message : 'Đăng nhập thất bại.'
        setError(nextError)
        throw loginError
      } finally {
        setIsSubmitting(false)
      }
    },
    [setToken],
  )

  const logout = useCallback(async () => {
    try {
      await postLogout()
    } finally {
      clearAuthState()
      setError(null)
    }
  }, [clearAuthState])

  const logoutAll = useCallback(async () => {
    const token = accessToken

    try {
      if (token) {
        await postLogoutAll(token)
      }
    } finally {
      clearAuthState()
      setError(null)
    }
  }, [accessToken, clearAuthState])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isBootstrapping,
      isSubmitting,
      role: user?.appRole ?? null,
      user,
      accessToken,
      error,
      login,
      logout,
      logoutAll,
      refreshAccessToken,
      clearError: () => {
        setError(null)
      },
    }),
    [accessToken, error, isBootstrapping, isSubmitting, login, logout, logoutAll, refreshAccessToken, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
