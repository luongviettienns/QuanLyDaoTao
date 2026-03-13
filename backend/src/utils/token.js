import { createHmac, timingSafeEqual } from 'crypto'

const DEFAULT_TTL_SECONDS = 60 * 60

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function getSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

export function createAccessToken(payload) {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || DEFAULT_TTL_SECONDS)
  const exp = now + expiresIn

  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
  }

  const payloadPart = base64UrlEncode(JSON.stringify(tokenPayload))
  const signature = createHmac('sha256', getSecret()).update(payloadPart).digest('base64url')

  return {
    token: `${payloadPart}.${signature}`,
    expiresIn,
  }
}

function base64UrlDecodeToString(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

export function verifyAccessToken(token) {
  const [payloadPart, signaturePart] = token.split('.')

  if (!payloadPart || !signaturePart) {
    return { ok: false, code: 'TOKEN_MALFORMED' }
  }

  const expectedSignature = createHmac('sha256', getSecret()).update(payloadPart).digest('base64url')

  const signatureBuffer = Buffer.from(signaturePart)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { ok: false, code: 'TOKEN_INVALID' }
  }

  const isValidSignature = timingSafeEqual(signatureBuffer, expectedBuffer)

  if (!isValidSignature) {
    return { ok: false, code: 'TOKEN_INVALID' }
  }

  let payload

  try {
    payload = JSON.parse(base64UrlDecodeToString(payloadPart))
  } catch {
    return { ok: false, code: 'TOKEN_MALFORMED' }
  }

  const now = Math.floor(Date.now() / 1000)

  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    return { ok: false, code: 'TOKEN_EXPIRED' }
  }

  return {
    ok: true,
    payload,
  }
}
