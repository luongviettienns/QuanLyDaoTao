import { z } from 'zod'
import { AppError } from '../utils/app-error.js'
import {
  attachClassToPeriod,
  createRegistrationPeriod,
  detachClassFromPeriod,
  findAcademicYearById,
  findCourseOfferingById,
  findCourseOfferingsByPeriodId,
  findOpenRegistrationPeriod,
  findPeriodClass,
  findRegistrationPeriodById,
  findRegistrationPeriods,
  updateRegistrationPeriod,
  updateRegistrationPeriodStatus,
} from '../repositories/registration-period.repository.js'

const registrationPeriodPayloadSchema = z.object({
  periodName: z.string().trim().min(1).max(255),
  academicYearId: z.coerce.bigint(),
  semester: z.number().int().min(1).max(3),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['UPCOMING', 'OPEN', 'CLOSED']).optional().default('UPCOMING'),
  periodType: z.enum(['NORMAL', 'RETAKE']).optional().default('NORMAL'),
  description: z.string().trim().max(500).nullable().optional(),
})

const attachClassPayloadSchema = z.object({
  classId: z.coerce.bigint(),
})

function mapSemesterLabel(semester: number) {
  if (semester === 1) return 'Học kỳ 1'
  if (semester === 2) return 'Học kỳ 2'
  return 'Học kỳ hè'
}

function mapPeriod(item: Awaited<ReturnType<typeof findRegistrationPeriodById>> extends infer T
  ? T extends null
    ? never
    : T
  : never) {
  return {
    id: item.periodId.toString(),
    periodName: item.periodName,
    semester: item.semester,
    semesterLabel: mapSemesterLabel(item.semester),
    startDate: item.startDate.toISOString(),
    endDate: item.endDate.toISOString(),
    status: item.status,
    periodType: item.periodType,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt?.toISOString() ?? null,
    academicYear: {
      id: item.academicYear.academicYearId.toString(),
      yearName: item.academicYear.yearName,
      cohortCode: item.academicYear.cohortCode,
    },
  }
}

export function validateRegistrationPeriodPayload(input: unknown) {
  const result = registrationPeriodPayloadSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu đợt đăng ký không hợp lệ.', result.error.flatten())
  }

  const startDate = new Date(result.data.startDate)
  const endDate = new Date(result.data.endDate)

  if (!(startDate < endDate)) {
    throw new AppError(400, 'INVALID_PERIOD_RANGE', 'Thời gian đợt đăng ký không hợp lệ.')
  }

  return {
    ...result.data,
    periodName: result.data.periodName.trim(),
    startDate,
    endDate,
    description: result.data.description?.trim() || null,
  }
}

export function validateAttachClassPayload(input: unknown) {
  const result = attachClassPayloadSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu gắn lớp vào đợt đăng ký không hợp lệ.', result.error.flatten())
  }

  return result.data
}

export async function getRegistrationPeriodsList() {
  const items = await findRegistrationPeriods()

  return {
    items: items.map((item) => ({
      id: item.periodId.toString(),
      periodName: item.periodName,
      semester: item.semester,
      semesterLabel: mapSemesterLabel(item.semester),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      status: item.status,
      periodType: item.periodType,
      description: item.description,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt?.toISOString() ?? null,
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
    })),
  }
}

export async function createRegistrationPeriodRecord(
  userId: bigint | null,
  input: ReturnType<typeof validateRegistrationPeriodPayload>,
) {
  const academicYear = await findAcademicYearById(input.academicYearId)
  if (!academicYear) {
    throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Không tìm thấy niên khoá.')
  }

  if (input.status === 'OPEN') {
    const openPeriod = await findOpenRegistrationPeriod(input.academicYearId, input.semester, input.periodType)
    if (openPeriod) {
      throw new AppError(409, 'OPEN_PERIOD_EXISTS', 'Đã tồn tại đợt đăng ký mở cho học kỳ và loại đợt này.')
    }
  }

  const created = await createRegistrationPeriod({
    periodName: input.periodName,
    academicYearId: input.academicYearId,
    semester: input.semester,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    periodType: input.periodType,
    description: input.description,
    createdBy: userId,
  })

  return { registrationPeriod: mapPeriod(created) }
}

export async function updateRegistrationPeriodRecord(
  periodId: bigint,
  userId: bigint | null,
  input: ReturnType<typeof validateRegistrationPeriodPayload>,
) {
  const current = await findRegistrationPeriodById(periodId)
  if (!current) {
    throw new AppError(404, 'REGISTRATION_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đăng ký.')
  }

  const academicYear = await findAcademicYearById(input.academicYearId)
  if (!academicYear) {
    throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Không tìm thấy niên khoá.')
  }

  if (input.status === 'OPEN') {
    const openPeriod = await findOpenRegistrationPeriod(input.academicYearId, input.semester, input.periodType)
    if (openPeriod && openPeriod.periodId !== periodId) {
      throw new AppError(409, 'OPEN_PERIOD_EXISTS', 'Đã tồn tại đợt đăng ký mở cho học kỳ và loại đợt này.')
    }
  }

  const updated = await updateRegistrationPeriod({
    periodId,
    periodName: input.periodName,
    academicYearId: input.academicYearId,
    semester: input.semester,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    periodType: input.periodType,
    description: input.description,
    updatedBy: userId,
  })

  return { registrationPeriod: mapPeriod(updated) }
}

export async function openRegistrationPeriodRecord(periodId: bigint, userId: bigint | null) {
  const current = await findRegistrationPeriodById(periodId)
  if (!current) {
    throw new AppError(404, 'REGISTRATION_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đăng ký.')
  }

  if (current.status === 'OPEN') {
    throw new AppError(409, 'REGISTRATION_PERIOD_ALREADY_OPEN', 'Đợt đăng ký đã ở trạng thái mở.')
  }

  const openPeriod = await findOpenRegistrationPeriod(current.academicYearId, current.semester, current.periodType)
  if (openPeriod && openPeriod.periodId !== periodId) {
    throw new AppError(409, 'OPEN_PERIOD_EXISTS', 'Đã tồn tại đợt đăng ký mở cho học kỳ và loại đợt này.')
  }

  const updated = await updateRegistrationPeriodStatus(periodId, 'OPEN', userId)
  return {
    registrationPeriod: {
      id: updated.periodId.toString(),
      periodName: updated.periodName,
      status: updated.status,
      semester: updated.semester,
      semesterLabel: mapSemesterLabel(updated.semester),
      periodType: updated.periodType,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      academicYear: {
        id: updated.academicYear.academicYearId.toString(),
        yearName: updated.academicYear.yearName,
        cohortCode: updated.academicYear.cohortCode,
      },
    },
  }
}

export async function closeRegistrationPeriodRecord(periodId: bigint, userId: bigint | null) {
  const current = await findRegistrationPeriodById(periodId)
  if (!current) {
    throw new AppError(404, 'REGISTRATION_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đăng ký.')
  }

  if (current.status !== 'OPEN') {
    throw new AppError(409, 'REGISTRATION_PERIOD_NOT_OPEN', 'Chỉ có thể đóng đợt đăng ký đang mở.')
  }

  const updated = await updateRegistrationPeriodStatus(periodId, 'CLOSED', userId)
  return {
    registrationPeriod: {
      id: updated.periodId.toString(),
      periodName: updated.periodName,
      status: updated.status,
      semester: updated.semester,
      semesterLabel: mapSemesterLabel(updated.semester),
      periodType: updated.periodType,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      academicYear: {
        id: updated.academicYear.academicYearId.toString(),
        yearName: updated.academicYear.yearName,
        cohortCode: updated.academicYear.cohortCode,
      },
    },
  }
}

export async function attachClassToRegistrationPeriodRecord(
  periodId: bigint,
  userId: bigint | null,
  input: ReturnType<typeof validateAttachClassPayload>,
) {
  const period = await findRegistrationPeriodById(periodId)
  if (!period) {
    throw new AppError(404, 'REGISTRATION_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đăng ký.')
  }

  const courseOffering = await findCourseOfferingById(input.classId)
  if (!courseOffering) {
    throw new AppError(404, 'COURSE_OFFERING_NOT_FOUND', 'Không tìm thấy lớp học phần.')
  }

  if (courseOffering.academicYearId !== period.academicYearId) {
    throw new AppError(409, 'COURSE_OFFERING_YEAR_MISMATCH', 'Lớp học phần không cùng niên khoá với đợt đăng ký.')
  }

  if (courseOffering.semester !== period.semester) {
    throw new AppError(409, 'COURSE_OFFERING_SEMESTER_MISMATCH', 'Lớp học phần không cùng học kỳ với đợt đăng ký.')
  }

  const existing = await findPeriodClass(periodId, input.classId)
  if (existing) {
    throw new AppError(409, 'PERIOD_CLASS_EXISTS', 'Lớp học phần đã được gắn vào đợt đăng ký này.')
  }

  const attached = await attachClassToPeriod(periodId, input.classId, userId)

  return {
    periodClass: {
      id: attached.periodClassId.toString(),
      registrationPeriod: {
        id: attached.registrationPeriod.periodId.toString(),
        periodName: attached.registrationPeriod.periodName,
        semester: attached.registrationPeriod.semester,
        semesterLabel: mapSemesterLabel(attached.registrationPeriod.semester),
        status: attached.registrationPeriod.status,
      },
      courseOffering: {
        id: attached.class.classId.toString(),
        classCode: attached.class.classCode,
        className: attached.class.className,
      },
    },
  }
}

export async function detachClassFromRegistrationPeriodRecord(periodId: bigint, classId: bigint, userId: bigint | null) {
  const period = await findRegistrationPeriodById(periodId)
  if (!period) {
    throw new AppError(404, 'REGISTRATION_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đăng ký.')
  }

  const courseOffering = await findCourseOfferingById(classId)
  if (!courseOffering) {
    throw new AppError(404, 'COURSE_OFFERING_NOT_FOUND', 'Không tìm thấy lớp học phần.')
  }

  const existing = await findPeriodClass(periodId, classId)
  if (!existing) {
    throw new AppError(404, 'PERIOD_CLASS_NOT_FOUND', 'Không tìm thấy lớp học phần trong đợt đăng ký.')
  }

  await detachClassFromPeriod(periodId, classId, userId)
  return { ok: true }
}

export async function getCourseOfferingsByRegistrationPeriod(periodId: bigint) {
  const period = await findRegistrationPeriodById(periodId)
  if (!period) {
    throw new AppError(404, 'REGISTRATION_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đăng ký.')
  }

  const items = await findCourseOfferingsByPeriodId(periodId)

  return {
    registrationPeriod: {
      id: period.periodId.toString(),
      periodName: period.periodName,
      semester: period.semester,
      semesterLabel: mapSemesterLabel(period.semester),
      status: period.status,
      periodType: period.periodType,
      academicYear: {
        id: period.academicYear.academicYearId.toString(),
        yearName: period.academicYear.yearName,
        cohortCode: period.academicYear.cohortCode,
      },
    },
    items: items.map((item) => ({
      id: item.class.classId.toString(),
      classCode: item.class.classCode,
      className: item.class.className,
      semester: item.class.semester,
      semesterLabel: item.class.semester === null ? null : mapSemesterLabel(item.class.semester),
      maxStudents: item.class.maxStudents,
      currentEnrollment: item.class.currentEnrollment,
      subject: {
        id: item.class.subject.subjectId.toString(),
        subjectCode: item.class.subject.subjectCode,
        subjectName: item.class.subject.subjectName,
        credits: item.class.subject.credits,
      },
      lecturer: item.class.lecturer
        ? {
            id: item.class.lecturer.lecturerId.toString(),
            code: item.class.lecturer.lecturerCode,
            fullName: item.class.lecturer.fullName,
          }
        : null,
    })),
  }
}
