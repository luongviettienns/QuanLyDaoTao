import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const SCRYPT_KEYLEN = 64

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, storedHash) {
  const [salt, hashHex] = storedHash.split(':')

  if (!salt || !hashHex) {
    return false
  }

  const derivedHex = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  const hashBuffer = Buffer.from(hashHex, 'hex')
  const derivedBuffer = Buffer.from(derivedHex, 'hex')

  if (hashBuffer.length !== derivedBuffer.length) {
    return false
  }

  return timingSafeEqual(hashBuffer, derivedBuffer)
}
