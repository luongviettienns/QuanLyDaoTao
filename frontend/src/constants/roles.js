export const ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
}

export function getHomePathByRole(role) {
  if (role === ROLES.ADMIN) return '/admin'
  if (role === ROLES.LECTURER) return '/lecturer'
  if (role === ROLES.STUDENT) return '/student'
  return '/forbidden'
}
