import type { Request, Response } from 'express'
import {
  createMyEnrollment,
  deleteMyEnrollment,
  getMyEnrollments,
  validateEnrollmentPayload,
} from '../services/enrollment.service.js'
import { AppError } from '../utils/app-error.js'
import { successResponse } from '../utils/response.js'

function parseEnrollmentId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'INVALID_ENROLLMENT_ID', 'Mã đăng ký học phần không hợp lệ.')
  }

  try {
    return BigInt(value)
  } catch {
    throw new AppError(400, 'INVALID_ENROLLMENT_ID', 'Mã đăng ký học phần không hợp lệ.')
  }
}

export async function getMyEnrollmentsController(req: Request, res: Response) {
  const data = await getMyEnrollments(req.auth!.userId)
  res.status(200).json(successResponse('Lấy danh sách đăng ký học phần thành công.', data))
}

export async function createMyEnrollmentController(req: Request, res: Response) {
  const input = validateEnrollmentPayload(req.body)
  const data = await createMyEnrollment(req.auth!.userId, input)

  res.status(201).json(successResponse('Đăng ký học phần thành công.', data))
}

export async function deleteMyEnrollmentController(req: Request, res: Response) {
  const enrollmentId = parseEnrollmentId(req.params.id)
  const data = await deleteMyEnrollment(req.auth!.userId, enrollmentId)

  res.status(200).json(successResponse('Huỷ đăng ký học phần thành công.', data))
}
