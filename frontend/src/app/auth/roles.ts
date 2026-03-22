export const appRoles = ['admin', 'lecturer', 'advisor', 'student'] as const

export type AppRole = (typeof appRoles)[number]

export const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  lecturer: 'Giảng viên',
  advisor: 'Cố vấn',
  student: 'Sinh viên',
}

export const defaultRoleRoute: Record<AppRole, string> = {
  admin: '/app/admin',
  lecturer: '/app/lecturer',
  advisor: '/app/lecturer',
  student: '/app/student',
}
