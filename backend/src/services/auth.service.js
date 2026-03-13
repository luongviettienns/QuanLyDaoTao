import { findUserById, findUserByIdentifier } from '../repositories/user.repository.js'
import { verifyPassword } from '../utils/password.js'
import { createAccessToken } from '../utils/token.js'

export function login({ identifier, password }) {
  const user = findUserByIdentifier(identifier)

  if (!user) {
    return null
  }

  const isValidPassword = verifyPassword(password, user.passwordHash)

  if (!isValidPassword) {
    return null
  }

  const { token, expiresIn } = createAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  })

  return {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  }
}

export function getCurrentUser(authPayload) {
  const userId = authPayload?.sub

  if (!userId) {
    return null
  }

  const user = findUserById(userId)

  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
  }
}
