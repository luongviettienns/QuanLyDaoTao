import { getCurrentUser, login } from '../services/auth.service.js'

export function loginController(req, res) {
  const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!identifier || !password) {
    return res.status(422).json({
      success: false,
      message: 'identifier and password are required',
    })
  }

  const authResult = login({ identifier, password })

  if (!authResult) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  return res.json({
    success: true,
    data: authResult,
  })
}

export function meController(req, res) {
  const user = getCurrentUser(req.auth)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'USER_NOT_FOUND',
    })
  }

  return res.json({
    success: true,
    data: {
      user,
    },
  })
}

export function logoutController(_req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  })
}
