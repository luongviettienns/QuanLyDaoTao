import type { NextFunction, Request, Response } from 'express'
import type { AuthRequestContext } from '../types/auth-request.js'
import { AppError } from '../utils/app-error.js'
import { verifyAccessToken } from '../utils/jwt.js'

export type { AuthRequestContext }

export function authenticate() {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization
      const match = header?.match(/^Bearer\s+(\S+)/i)

      if (!match?.[1]) {
        throw new AppError(401, 'UNAUTHORIZED', 'Thiếu access token.')
      }

      const payload = verifyAccessToken(match[1])

      const ctx: AuthRequestContext = {
        userId: BigInt(payload.sub),
        roleName: payload.role,
        username: payload.username,
        email: payload.email,
      }

      req.auth = ctx
      next()
    } catch (error) {
      next(error)
    }
  }
}
