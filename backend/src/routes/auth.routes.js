import { Router } from 'express'
import { loginController, logoutController, meController } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const authRouter = Router()

authRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    message: 'Auth route is ready',
  })
})

authRouter.post('/login', loginController)
authRouter.get('/me', authenticate, meController)
authRouter.post('/logout', authenticate, logoutController)

export default authRouter
