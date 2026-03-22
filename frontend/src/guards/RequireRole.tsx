import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'
import type { AppRole } from '@/app/auth/roles'

type RequireRoleProps = {
  allowedRoles: AppRole[]
}

export function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { role } = useAuth()

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/app/forbidden" replace />
  }

  return <Outlet />
}
