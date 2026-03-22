import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/app-error.js'

/** Require `authenticate()` to run first. */
export function authorizeRoles(...allowedRoleNames: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new AppError(401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập.'))
      return
    }

    if (!allowedRoleNames.includes(req.auth.roleName)) {
      next(new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập.'))
      return
    }

    next()
  }
}
