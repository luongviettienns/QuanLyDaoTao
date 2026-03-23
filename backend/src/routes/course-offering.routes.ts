import { Router } from 'express'
import {
  createCourseOfferingController,
  getCourseOfferingDetailController,
  getCourseOfferingsController,
  updateCourseOfferingController,
} from '../controllers/course-offering.controller.js'
import { AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const courseOfferingRouter = Router()

courseOfferingRouter.get(
  '/course-offerings',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getCourseOfferingsController),
)

courseOfferingRouter.get(
  '/course-offerings/:id',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getCourseOfferingDetailController),
)

courseOfferingRouter.post(
  '/course-offerings',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(createCourseOfferingController),
)

courseOfferingRouter.put(
  '/course-offerings/:id',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(updateCourseOfferingController),
)
