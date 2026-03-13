import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/rbac.middleware.js'
import { ROLES } from '../constants/roles.js'

const adminRouter = Router()

adminRouter.get('/ping', authenticate, authorize(ROLES.ADMIN), (_req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
  })
})

export default adminRouter
