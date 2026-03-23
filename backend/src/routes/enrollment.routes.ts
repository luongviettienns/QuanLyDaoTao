import { Router } from 'express'
import {
  createMyEnrollmentController,
  deleteMyEnrollmentController,
  getMyEnrollmentsController,
} from '../controllers/enrollment.controller.js'
import { AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const enrollmentRouter = Router()

enrollmentRouter.get(
  '/me/enrollments',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.STUDENT),
  asyncHandler(getMyEnrollmentsController),
)

enrollmentRouter.post(
  '/me/enrollments',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.STUDENT),
  asyncHandler(createMyEnrollmentController),
)

enrollmentRouter.delete(
  '/me/enrollments/:id',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.STUDENT),
  asyncHandler(deleteMyEnrollmentController),
)
