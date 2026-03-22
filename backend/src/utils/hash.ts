import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'

export async function comparePassword(plainText: string, passwordHash: string) {
  return bcrypt.compare(plainText, passwordHash)
}

export function generateOpaqueRefreshToken() {
  return randomBytes(48).toString('hex')
}

export function hashRefreshToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex')
}
