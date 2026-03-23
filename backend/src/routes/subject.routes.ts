import { Router } from 'express'
import {
  createSubjectController,
  deleteSubjectController,
  getSubjectDetailController,
  getSubjectsController,
  updateSubjectController,
} from '../controllers/subject.controller.js'
import { AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

export const subjectRouter = Router()

subjectRouter.get(
  '/subjects',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getSubjectsController),
)

subjectRouter.get(
  '/subjects/:id',
  authenticate(),
  authorizeRoles(
    AUTH_ROLE_NAMES.ADMIN,
    AUTH_ROLE_NAMES.LECTURER,
    AUTH_ROLE_NAMES.ADVISOR,
    AUTH_ROLE_NAMES.STUDENT,
  ),
  asyncHandler(getSubjectDetailController),
)

subjectRouter.post(
  '/subjects',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(createSubjectController),
)

subjectRouter.put(
  '/subjects/:id',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(updateSubjectController),
)

subjectRouter.delete(
  '/subjects/:id',
  authenticate(),
  authorizeRoles(AUTH_ROLE_NAMES.ADMIN),
  asyncHandler(deleteSubjectController),
)
