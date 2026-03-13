import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { loginApi, logoutApi, meApi } from '../features/auth/services/authApi'

const TOKEN_KEY = 'auth.accessToken'
const REMEMBER_KEY = 'auth.rememberMe'

export const AuthContext = createContext(null)

function loadStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REMEMBER_KEY)
}

function storeToken(token, rememberMe) {
  clearStoredToken()

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REMEMBER_KEY, '1')
    return
  }

  sessionStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REMEMBER_KEY, '0')
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(loadStoredToken)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const logout = useCallback(async () => {
    const token = loadStoredToken()

    try {
      if (token) {
        await logoutApi(token)
      }
    } finally {
      setAccessToken('')
      setUser(null)
      setIsAuthenticated(false)
      clearStoredToken()
    }
  }, [])

  const bootstrapAuth = useCallback(async () => {
    const token = loadStoredToken()

    if (!token) {
      logout()
      setIsBootstrapping(false)
      return
    }

    const meResult = await meApi(token)

    if (!meResult.ok) {
      if (meResult.status === 401) {
        logout()
      }

      setIsBootstrapping(false)
      return
    }

    setAccessToken(token)
    setUser(meResult.data?.data?.user || null)
    setIsAuthenticated(true)
    setIsBootstrapping(false)
  }, [logout])

  useEffect(() => {
    bootstrapAuth()
  }, [bootstrapAuth])

  const login = useCallback(async ({ identifier, password, rememberMe }) => {
    const loginResult = await loginApi({ identifier, password, rememberMe })

    if (!loginResult.ok) {
      return loginResult
    }

    const token = loginResult.data?.data?.accessToken || ''
    const loginUser = loginResult.data?.data?.user || null

    if (!token || !loginUser) {
      return {
        ok: false,
        status: 500,
        error: {
          code: 'INVALID_AUTH_RESPONSE',
          message: 'Invalid authentication response',
        },
      }
    }

    storeToken(token, Boolean(rememberMe))
    setAccessToken(token)
    setUser(loginUser)
    setIsAuthenticated(true)

    return {
      ok: true,
      status: loginResult.status,
      data: loginResult.data,
    }
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated,
      isBootstrapping,
      login,
      logout,
    }),
    [accessToken, user, isAuthenticated, isBootstrapping, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
