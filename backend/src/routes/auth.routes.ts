import { Router } from 'express'
import {
  loginController,
  logoutAllController,
  logoutController,
  meController,
  refreshController,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const authRouter = Router()

authRouter.post('/auth/login', asyncHandler(loginController))
authRouter.post('/auth/refresh', asyncHandler(refreshController))
authRouter.post('/auth/logout', asyncHandler(logoutController))
authRouter.post('/auth/logout-all', authenticate(), asyncHandler(logoutAllController))
authRouter.get('/auth/me', authenticate(), asyncHandler(meController))
