import type { Request, Response } from 'express'
import {
  createCourseOfferingRecord,
  getCourseOfferingDetail,
  getCourseOfferings,
  updateCourseOfferingRecord,
  validateCourseOfferingPayload,
} from '../services/course-offering.service.js'
import { AppError } from '../utils/app-error.js'
import { successResponse } from '../utils/response.js'

function parseCourseOfferingId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'INVALID_COURSE_OFFERING_ID', 'Mã lớp học phần không hợp lệ.')
  }

  try {
    return BigInt(value)
  } catch {
    throw new AppError(400, 'INVALID_COURSE_OFFERING_ID', 'Mã lớp học phần không hợp lệ.')
  }
}

export async function getCourseOfferingsController(_req: Request, res: Response) {
  const data = await getCourseOfferings()
  res.status(200).json(successResponse('Lấy danh sách lớp học phần thành công.', data))
}

export async function getCourseOfferingDetailController(req: Request, res: Response) {
  const classId = parseCourseOfferingId(req.params.id)
  const data = await getCourseOfferingDetail(classId)

  res.status(200).json(successResponse('Lấy chi tiết lớp học phần thành công.', data))
}

export async function createCourseOfferingController(req: Request, res: Response) {
  const input = validateCourseOfferingPayload(req.body)
  const data = await createCourseOfferingRecord(req.auth?.userId ?? null, input)

  res.status(201).json(successResponse('Tạo lớp học phần thành công.', data))
}

export async function updateCourseOfferingController(req: Request, res: Response) {
  const classId = parseCourseOfferingId(req.params.id)
  const input = validateCourseOfferingPayload(req.body)
  const data = await updateCourseOfferingRecord(classId, req.auth?.userId ?? null, input)

  res.status(200).json(successResponse('Cập nhật lớp học phần thành công.', data))
}
