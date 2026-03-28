import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ACCESS_TOKEN_KEY } from '@/app/auth/auth-storage'
import { configureAccessTokenSetter } from '@/lib/auth-token-bridge'
import { resetSessionExpiredEmitter } from '@/lib/session-expired'
import {
  ApiError,
  type AuthUser,
  getMeApi,
  loginApi,
  refreshAccessTokenApi,
  type LoginPayload,
} from './auth-api'

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  isBootstrapping: boolean
}

type LogoutOptions = {
  reason?: 'session_expired'
}

type AuthContextValue = AuthState & {
  login: (payload: LoginPayload) => Promise<void>
  logout: (options?: LogoutOptions) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isBootstrapping: true,
  })

  useEffect(() => {
    configureAccessTokenSetter((token) => {
      setState((s) => ({ ...s, accessToken: token }))
    })
  }, [])

  useEffect(() => {
    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (!savedToken) {
      setState((prev) => ({ ...prev, isBootstrapping: false }))
      return
    }

    void getMeApi(savedToken)
      .then((result) => {
        setState({ user: result.user, accessToken: savedToken, isBootstrapping: false })
      })
      .catch(async () => {
        try {
          const refreshed = await refreshAccessTokenApi()
          localStorage.setItem(ACCESS_TOKEN_KEY, refreshed.accessToken)
          const me = await getMeApi(refreshed.accessToken)
          setState({ user: me.user, accessToken: refreshed.accessToken, isBootstrapping: false })
        } catch {
          localStorage.removeItem(ACCESS_TOKEN_KEY)
          setState({ user: null, accessToken: null, isBootstrapping: false })
        }
      })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      async login(payload) {
        const result = await loginApi(payload)
        localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken)
        resetSessionExpiredEmitter()
        setState({ user: result.user, accessToken: result.accessToken, isBootstrapping: false })
        toast.success(`Đăng nhập thành công. Xin chào ${result.user.fullName}.`)
      },
      logout(options) {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        setState({ user: null, accessToken: null, isBootstrapping: false })
        if (options?.reason === 'session_expired') {
          toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        } else {
          toast.info('Bạn đã đăng xuất khỏi hệ thống.')
        }
      },
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new ApiError('useAuth phai duoc dung trong AuthProvider.')
  }

  return context
}
