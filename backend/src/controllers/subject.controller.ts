import type { Request, Response } from 'express'
import {
  createSubjectRecord,
  deleteSubjectRecord,
  getSubjectDetail,
  getSubjects,
  updateSubjectRecord,
  validateSubjectPayload,
} from '../services/subject.service.js'
import { AppError } from '../utils/app-error.js'
import { successResponse } from '../utils/response.js'

function parseSubjectId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'INVALID_SUBJECT_ID', 'Mã môn học không hợp lệ.')
  }

  try {
    return BigInt(value)
  } catch {
    throw new AppError(400, 'INVALID_SUBJECT_ID', 'Mã môn học không hợp lệ.')
  }
}

export async function getSubjectsController(_req: Request, res: Response) {
  const data = await getSubjects()
  res.status(200).json(successResponse('Lấy danh sách môn học thành công.', data))
}

export async function getSubjectDetailController(req: Request, res: Response) {
  const subjectId = parseSubjectId(req.params.id)
  const data = await getSubjectDetail(subjectId)

  res.status(200).json(successResponse('Lấy chi tiết môn học thành công.', data))
}

export async function createSubjectController(req: Request, res: Response) {
  const input = validateSubjectPayload(req.body)
  const data = await createSubjectRecord(req.auth?.userId ?? null, input)

  res.status(201).json(successResponse('Tạo môn học thành công.', data))
}

export async function updateSubjectController(req: Request, res: Response) {
  const subjectId = parseSubjectId(req.params.id)
  const input = validateSubjectPayload(req.body)
  const data = await updateSubjectRecord(subjectId, req.auth?.userId ?? null, input)

  res.status(200).json(successResponse('Cập nhật môn học thành công.', data))
}

export async function deleteSubjectController(req: Request, res: Response) {
  const subjectId = parseSubjectId(req.params.id)
  const data = await deleteSubjectRecord(subjectId, req.auth?.userId ?? null)

  res.status(200).json(successResponse('Xoá môn học thành công.', data))
}
