import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!user?.role) {
    return <Navigate to="/forbidden" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}

export default RoleRoute
