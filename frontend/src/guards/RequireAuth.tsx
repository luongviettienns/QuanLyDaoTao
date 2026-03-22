import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'

export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Đang khôi phục phiên đăng nhập...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
