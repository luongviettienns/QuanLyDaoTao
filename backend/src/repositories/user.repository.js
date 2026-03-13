import { ROLES } from '../constants/roles.js'
import { hashPassword } from '../utils/password.js'

const users = [
  {
    id: 'u-admin-001',
    name: 'Admin User',
    email: 'admin@truong.edu.vn',
    username: 'admin01',
    role: ROLES.ADMIN,
    passwordHash: hashPassword('Admin@123'),
  },
  {
    id: 'u-lecturer-001',
    name: 'Giang Vien A',
    email: 'gv.nguyenvana@truong.edu.vn',
    username: 'gv.nguyenvana',
    role: ROLES.LECTURER,
    passwordHash: hashPassword('Lecturer@123'),
  },
  {
    id: 'u-student-001',
    name: 'Sinh Vien A',
    email: 'sv.nguyenvana@truong.edu.vn',
    username: 'sv.nguyenvana',
    role: ROLES.STUDENT,
    passwordHash: hashPassword('Student@123'),
  },
]

export function findUserByIdentifier(identifier) {
  const normalized = identifier.trim().toLowerCase()
  return users.find(
    (user) => user.email.toLowerCase() === normalized || user.username.toLowerCase() === normalized,
  )
}

export function findUserById(id) {
  return users.find((user) => user.id === id)
}
