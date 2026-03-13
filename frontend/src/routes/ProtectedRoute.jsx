import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
