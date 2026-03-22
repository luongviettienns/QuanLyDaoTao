import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'
import { defaultRoleRoute } from '@/app/auth/roles'

export function RoleHomeRedirect() {
  const { role } = useAuth()

  if (!role) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={defaultRoleRoute[role]} replace />
}
