import { Router } from 'express'
import {
  createAdministrativeClassController,
  getAdministrativeClassDetailController,
  getAdministrativeClassesController,
  getAdministrativeClassStudentsController,
  updateAdministrativeClassController,
} from '../controllers/administrative-class.controller.js'
import { AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const administrativeClassRouter = Router()

administrativeClassRouter.get(
  '/administrative-classes',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getAdministrativeClassesController),
)

administrativeClassRouter.get(
  '/administrative-classes/:id',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getAdministrativeClassDetailController),
)

administrativeClassRouter.get(
  '/administrative-classes/:id/students',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN, AUTH_ROLE_NAMES.LECTURER, AUTH_ROLE_NAMES.ADVISOR),
  asyncHandler(getAdministrativeClassStudentsController),
)

administrativeClassRouter.post(
  '/administrative-classes',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(createAdministrativeClassController),
)

administrativeClassRouter.put(
  '/administrative-classes/:id',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(updateAdministrativeClassController),
)
