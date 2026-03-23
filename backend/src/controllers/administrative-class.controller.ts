import type { Request, Response } from 'express'
import {
  createAdministrativeClassRecord,
  getAdministrativeClassDetail,
  getAdministrativeClasses,
  getAdministrativeClassStudents,
  updateAdministrativeClassRecord,
  validateAdministrativeClassPayload,
} from '../services/administrative-class.service.js'
import { AppError } from '../utils/app-error.js'
import { successResponse } from '../utils/response.js'

function parseAdministrativeClassId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'INVALID_ADMIN_CLASS_ID', 'Mã lớp hành chính không hợp lệ.')
  }

  try {
    return BigInt(value)
  } catch {
    throw new AppError(400, 'INVALID_ADMIN_CLASS_ID', 'Mã lớp hành chính không hợp lệ.')
  }
}

export async function getAdministrativeClassesController(_req: Request, res: Response) {
  const data = await getAdministrativeClasses()
  res.status(200).json(successResponse('Lấy danh sách lớp hành chính thành công.', data))
}

export async function getAdministrativeClassDetailController(req: Request, res: Response) {
  const adminClassId = parseAdministrativeClassId(req.params.id)
  const data = await getAdministrativeClassDetail(adminClassId)

  res.status(200).json(successResponse('Lấy chi tiết lớp hành chính thành công.', data))
}

export async function getAdministrativeClassStudentsController(req: Request, res: Response) {
  const adminClassId = parseAdministrativeClassId(req.params.id)
  const data = await getAdministrativeClassStudents(adminClassId)

  res.status(200).json(successResponse('Lấy danh sách sinh viên theo lớp thành công.', data))
}

export async function createAdministrativeClassController(req: Request, res: Response) {
  const input = validateAdministrativeClassPayload(req.body)
  const data = await createAdministrativeClassRecord(req.auth?.userId ?? null, input)

  res.status(201).json(successResponse('Tạo lớp hành chính thành công.', data))
}

export async function updateAdministrativeClassController(req: Request, res: Response) {
  const adminClassId = parseAdministrativeClassId(req.params.id)
  const input = validateAdministrativeClassPayload(req.body)
  const data = await updateAdministrativeClassRecord(adminClassId, req.auth?.userId ?? null, input)

  res.status(200).json(successResponse('Cập nhật lớp hành chính thành công.', data))
}
