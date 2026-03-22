import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { config } from '../config.js'
import { AppError } from './app-error.js'

export type AccessTokenPayload = {
  sub: string
  role: string
  username: string
  email: string
  type: 'access'
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>) {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    config.jwtAccessSecret as Secret,
    {
      expiresIn: config.jwtAccessExpiresIn as SignOptions['expiresIn'],
    },
  )
}

function isAccessPayload(value: unknown): value is AccessTokenPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const v = value as Record<string, unknown>
  return (
    v.type === 'access' &&
    typeof v.sub === 'string' &&
    typeof v.role === 'string' &&
    typeof v.username === 'string' &&
    typeof v.email === 'string'
  )
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret as Secret)

    if (!isAccessPayload(decoded)) {
      throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token không hợp lệ.')
    }

    return decoded
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token không hợp lệ hoặc đã hết hạn.')
  }
}
