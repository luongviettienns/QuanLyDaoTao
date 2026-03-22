import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppShell } from '@/layouts/AppShell'
import { RequireAuth } from '@/guards/RequireAuth'
import { RequireRole } from '@/guards/RequireRole'
import { LandingPage } from '@/pages/public/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/app/DashboardPage'
import { AdminPage } from '@/pages/app/admin/AdminPage'
import { LecturerPage } from '@/pages/app/lecturer/LecturerPage'
import { StudentPage } from '@/pages/app/student/StudentPage'
import { ForbiddenPage } from '@/pages/app/ForbiddenPage'
import { NotFoundPage } from '@/pages/app/NotFoundPage'
import { RoleHomeRedirect } from '@/pages/app/RoleHomeRedirect'

function LoginRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <p className="text-sm text-slate-500">Đang kiểm tra phiên...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return <LoginPage />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRoute />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<RoleHomeRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="forbidden" element={<ForbiddenPage />} />

          <Route element={<RequireRole allowedRoles={['admin']} />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['lecturer', 'advisor']} />}>
            <Route path="lecturer" element={<LecturerPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['student']} />}>
            <Route path="student" element={<StudentPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
