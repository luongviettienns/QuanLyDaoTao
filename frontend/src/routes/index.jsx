import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'
import RoleRoute from './RoleRoute'
import AdminHomePage from '../pages/AdminHomePage'
import ForbiddenPage from '../pages/ForbiddenPage'
import LecturerHomePage from '../pages/LecturerHomePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import StudentHomePage from '../pages/StudentHomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={[ROLES.ADMIN]}>
          <AdminHomePage />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lecturer',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={[ROLES.LECTURER]}>
          <LecturerHomePage />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={[ROLES.STUDENT]}>
          <StudentHomePage />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
