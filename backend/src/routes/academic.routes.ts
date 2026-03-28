import { Router } from 'express'
import {
  getAcademicReferenceController,
  getAcademicYearsController,
  getCurrentRegistrationPeriodController,
  getDepartmentsController,
  getSchoolYearsController,
  getSemesterMetadataController,
} from '../controllers/academic.controller.js'
import { AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const academicRouter = Router()

academicRouter.get(
  '/academic/reference-data',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getAcademicReferenceController),
)

academicRouter.get(
  '/academic/academic-years',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getAcademicYearsController),
)

academicRouter.get(
  '/academic/school-years',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getSchoolYearsController),
)

academicRouter.get(
  '/academic/departments',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(getDepartmentsController),
)

academicRouter.get(
  '/academic/semesters/metadata',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getSemesterMetadataController),
)

academicRouter.get(
  '/registration-periods/current',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getCurrentRegistrationPeriodController),
)
