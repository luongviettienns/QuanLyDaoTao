import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-provider'
import { SESSION_EXPIRED_EVENT } from '@/lib/session-expired'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'

/** JWT/refresh hết hạn → đăng xuất, toast, chuyển về /login. */
function SessionExpiredListener() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const handler = () => {
      logout({ reason: 'session_expired' })
      navigate('/login', { replace: true })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  }, [navigate, logout])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <p className="grid min-h-screen place-items-center text-muted-foreground">Dang tai phien dang nhap...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <p className="grid min-h-screen place-items-center text-muted-foreground">Dang tai phien dang nhap...</p>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <>
      <SessionExpiredListener />
      <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}
