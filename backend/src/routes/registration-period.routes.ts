import { Router } from 'express'
import {
  attachClassToRegistrationPeriodController,
  closeRegistrationPeriodController,
  createRegistrationPeriodController,
  detachClassFromRegistrationPeriodController,
  getCourseOfferingsByRegistrationPeriodController,
  getRegistrationPeriodsController,
  openRegistrationPeriodController,
  updateRegistrationPeriodController,
} from '../controllers/registration-period.controller.js'
import { AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const registrationPeriodRouter = Router()

registrationPeriodRouter.get(
  '/registration-periods',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getRegistrationPeriodsController),
)

registrationPeriodRouter.post(
  '/registration-periods',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(createRegistrationPeriodController),
)

registrationPeriodRouter.put(
  '/registration-periods/:id',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(updateRegistrationPeriodController),
)

registrationPeriodRouter.post(
  '/registration-periods/:id/open',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(openRegistrationPeriodController),
)

registrationPeriodRouter.post(
  '/registration-periods/:id/close',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(closeRegistrationPeriodController),
)

registrationPeriodRouter.post(
  '/registration-periods/:id/classes',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(attachClassToRegistrationPeriodController),
)

registrationPeriodRouter.delete(
  '/registration-periods/:id/classes/:classId',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(detachClassFromRegistrationPeriodController),
)

registrationPeriodRouter.get(
  '/registration-periods/:id/course-offerings',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getCourseOfferingsByRegistrationPeriodController),
)
