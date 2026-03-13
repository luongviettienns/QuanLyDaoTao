import { verifyAccessToken } from '../utils/token.js'

export function authenticate(req, res, next) {
  const authorizationHeader = req.header('authorization') || ''

  if (!authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'TOKEN_MISSING',
    })
  }

  const token = authorizationHeader.slice('Bearer '.length).trim()
  const verification = verifyAccessToken(token)

  if (!verification.ok) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: verification.code,
    })
  }

  req.auth = verification.payload
  return next()
}
