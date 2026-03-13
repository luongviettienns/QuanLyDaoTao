export function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.auth?.role

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        code: 'ROLE_MISSING',
      })
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'INSUFFICIENT_ROLE',
      })
    }

    return next()
  }
}
