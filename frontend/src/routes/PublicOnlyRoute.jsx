import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { getHomePathByRole } from '../constants/roles'

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()

  if (isBootstrapping) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathByRole(user?.role)} replace />
  }

  return children
}

export default PublicOnlyRoute
