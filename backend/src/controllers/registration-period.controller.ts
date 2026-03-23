import type { Request, Response } from 'express'
import {
  attachClassToRegistrationPeriodRecord,
  closeRegistrationPeriodRecord,
  createRegistrationPeriodRecord,
  detachClassFromRegistrationPeriodRecord,
  getCourseOfferingsByRegistrationPeriod,
  getRegistrationPeriodsList,
  openRegistrationPeriodRecord,
  updateRegistrationPeriodRecord,
  validateAttachClassPayload,
  validateRegistrationPeriodPayload,
} from '../services/registration-period.service.js'
import { AppError } from '../utils/app-error.js'
import { successResponse } from '../utils/response.js'

function parsePeriodId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'INVALID_PERIOD_ID', 'Mã đợt đăng ký không hợp lệ.')
  }

  try {
    return BigInt(value)
  } catch {
    throw new AppError(400, 'INVALID_PERIOD_ID', 'Mã đợt đăng ký không hợp lệ.')
  }
}

function parseClassId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'INVALID_CLASS_ID', 'Mã lớp học phần không hợp lệ.')
  }

  try {
    return BigInt(value)
  } catch {
    throw new AppError(400, 'INVALID_CLASS_ID', 'Mã lớp học phần không hợp lệ.')
  }
}

export async function getRegistrationPeriodsController(_req: Request, res: Response) {
  const data = await getRegistrationPeriodsList()
  res.status(200).json(successResponse('Lấy danh sách đợt đăng ký thành công.', data))
}

export async function createRegistrationPeriodController(req: Request, res: Response) {
  const input = validateRegistrationPeriodPayload(req.body)
  const data = await createRegistrationPeriodRecord(req.auth?.userId ?? null, input)

  res.status(201).json(successResponse('Tạo đợt đăng ký thành công.', data))
}

export async function updateRegistrationPeriodController(req: Request, res: Response) {
  const periodId = parsePeriodId(req.params.id)
  const input = validateRegistrationPeriodPayload(req.body)
  const data = await updateRegistrationPeriodRecord(periodId, req.auth?.userId ?? null, input)

  res.status(200).json(successResponse('Cập nhật đợt đăng ký thành công.', data))
}

export async function openRegistrationPeriodController(req: Request, res: Response) {
  const periodId = parsePeriodId(req.params.id)
  const data = await openRegistrationPeriodRecord(periodId, req.auth?.userId ?? null)

  res.status(200).json(successResponse('Mở đợt đăng ký thành công.', data))
}

export async function closeRegistrationPeriodController(req: Request, res: Response) {
  const periodId = parsePeriodId(req.params.id)
  const data = await closeRegistrationPeriodRecord(periodId, req.auth?.userId ?? null)

  res.status(200).json(successResponse('Đóng đợt đăng ký thành công.', data))
}

export async function attachClassToRegistrationPeriodController(req: Request, res: Response) {
  const periodId = parsePeriodId(req.params.id)
  const input = validateAttachClassPayload(req.body)
  const data = await attachClassToRegistrationPeriodRecord(periodId, req.auth?.userId ?? null, input)

  res.status(201).json(successResponse('Gắn lớp học phần vào đợt đăng ký thành công.', data))
}

export async function detachClassFromRegistrationPeriodController(req: Request, res: Response) {
  const periodId = parsePeriodId(req.params.id)
  const classId = parseClassId(req.params.classId)
  const data = await detachClassFromRegistrationPeriodRecord(periodId, classId, req.auth?.userId ?? null)

  res.status(200).json(successResponse('Gỡ lớp học phần khỏi đợt đăng ký thành công.', data))
}

export async function getCourseOfferingsByRegistrationPeriodController(req: Request, res: Response) {
  const periodId = parsePeriodId(req.params.id)
  const data = await getCourseOfferingsByRegistrationPeriod(periodId)

  res.status(200).json(successResponse('Lấy danh sách lớp học phần theo đợt đăng ký thành công.', data))
}
