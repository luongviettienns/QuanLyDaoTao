import type { Request, Response } from 'express'
import {
  getAcademicReferenceData,
  getAcademicYearsData,
  getCurrentRegistrationPeriodData,
  getRegistrationPeriodsData,
  getSchoolYearsData,
  getSemesterMetadata,
} from '../services/academic.service.js'
import { successResponse } from '../utils/response.js'

export async function getAcademicReferenceController(_req: Request, res: Response) {
  const data = await getAcademicReferenceData()

  res.status(200).json(successResponse('Lấy dữ liệu nền học vụ thành công.', data))
}

export async function getAcademicYearsController(_req: Request, res: Response) {
  const data = await getAcademicYearsData()

  res.status(200).json(successResponse('Lấy danh sách niên khoá thành công.', data))
}

export async function getSchoolYearsController(_req: Request, res: Response) {
  const data = await getSchoolYearsData()

  res.status(200).json(successResponse('Lấy danh sách năm học thành công.', data))
}

export async function getSemesterMetadataController(_req: Request, res: Response) {
  const data = await getSemesterMetadata()

  res.status(200).json(successResponse('Lấy metadata học kỳ thành công.', data))
}

export async function getRegistrationPeriodsController(_req: Request, res: Response) {
  const data = await getRegistrationPeriodsData()

  res.status(200).json(successResponse('Lấy danh sách đợt đăng ký thành công.', data))
}

export async function getCurrentRegistrationPeriodController(_req: Request, res: Response) {
  const data = await getCurrentRegistrationPeriodData()

  res.status(200).json(successResponse('Lấy đợt đăng ký hiện tại thành công.', data))
}
