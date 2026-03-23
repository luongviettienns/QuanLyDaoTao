import { z } from 'zod'
import { AppError } from '../utils/app-error.js'
import {
  createCourseOffering,
  findAcademicYearById,
  findActiveCourseOfferingByCode,
  findCourseOfferingById,
  findCourseOfferings,
  findLecturerById,
  findSchoolYearById,
  findSubjectById,
  updateCourseOffering,
} from '../repositories/course-offering.repository.js'

const courseOfferingPayloadSchema = z.object({
  classCode: z.string().trim().min(1, 'classCode is required').max(50, 'classCode is too long'),
  className: z.string().trim().min(1, 'className is required').max(255, 'className is too long'),
  subjectId: z.coerce.bigint(),
  lecturerId: z.union([z.coerce.bigint(), z.null()]).optional(),
  academicYearId: z.coerce.bigint(),
  schoolYearId: z.union([z.coerce.bigint(), z.null()]).optional(),
  semester: z.union([z.number().int().min(1).max(3), z.null()]).optional(),
  maxStudents: z.union([z.number().int().min(1), z.null()]).optional(),
})

function mapSemesterLabel(semester: number | null) {
  if (semester === 1) return 'Học kỳ 1'
  if (semester === 2) return 'Học kỳ 2'
  if (semester === 3) return 'Học kỳ hè'
  return null
}

function mapCourseOffering(item: Awaited<ReturnType<typeof findCourseOfferingById>> extends infer T
  ? T extends null
    ? never
    : T
  : never) {
  return {
    id: item.classId.toString(),
    classCode: item.classCode,
    className: item.className,
    semester: item.semester,
    semesterLabel: mapSemesterLabel(item.semester),
    maxStudents: item.maxStudents,
    currentEnrollment: item.currentEnrollment,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt?.toISOString() ?? null,
    subject: {
      id: item.subject.subjectId.toString(),
      subjectCode: item.subject.subjectCode,
      subjectName: item.subject.subjectName,
      credits: item.subject.credits,
    },
    lecturer: item.lecturer
      ? {
          id: item.lecturer.lecturerId.toString(),
          code: item.lecturer.lecturerCode,
          fullName: item.lecturer.fullName,
        }
      : null,
    academicYear: {
      id: item.academicYear.academicYearId.toString(),
      yearName: item.academicYear.yearName,
      cohortCode: item.academicYear.cohortCode,
    },
    schoolYear: item.schoolYear
      ? {
          id: item.schoolYear.schoolYearId.toString(),
          yearCode: item.schoolYear.yearCode,
          yearName: item.schoolYear.yearName,
        }
      : null,
  }
}

export function validateCourseOfferingPayload(input: unknown) {
  const result = courseOfferingPayloadSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu lớp học phần không hợp lệ.', result.error.flatten())
  }

  return {
    ...result.data,
    classCode: result.data.classCode.trim(),
    className: result.data.className.trim(),
    lecturerId: result.data.lecturerId ?? null,
    schoolYearId: result.data.schoolYearId ?? null,
    semester: result.data.semester ?? null,
    maxStudents: result.data.maxStudents ?? null,
  }
}

export async function getCourseOfferings() {
  const items = await findCourseOfferings()

  return {
    items: items.map((item) => ({
      id: item.classId.toString(),
      classCode: item.classCode,
      className: item.className,
      semester: item.semester,
      semesterLabel: mapSemesterLabel(item.semester),
      maxStudents: item.maxStudents,
      currentEnrollment: item.currentEnrollment,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt?.toISOString() ?? null,
      subject: {
        id: item.subject.subjectId.toString(),
        subjectCode: item.subject.subjectCode,
        subjectName: item.subject.subjectName,
        credits: item.subject.credits,
      },
      lecturer: item.lecturer
        ? {
            id: item.lecturer.lecturerId.toString(),
            code: item.lecturer.lecturerCode,
            fullName: item.lecturer.fullName,
          }
        : null,
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
      schoolYear: item.schoolYear
        ? {
            id: item.schoolYear.schoolYearId.toString(),
            yearCode: item.schoolYear.yearCode,
            yearName: item.schoolYear.yearName,
          }
        : null,
    })),
  }
}

export async function getCourseOfferingDetail(classId: bigint) {
  const item = await findCourseOfferingById(classId)

  if (!item) {
    throw new AppError(404, 'COURSE_OFFERING_NOT_FOUND', 'Không tìm thấy lớp học phần.')
  }

  return { courseOffering: mapCourseOffering(item) }
}

export async function createCourseOfferingRecord(
  userId: bigint | null,
  input: ReturnType<typeof validateCourseOfferingPayload>,
) {
  const subject = await findSubjectById(input.subjectId)
  if (!subject) {
    throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Không tìm thấy môn học.')
  }

  const academicYear = await findAcademicYearById(input.academicYearId)
  if (!academicYear) {
    throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Không tìm thấy niên khoá.')
  }

  if (input.schoolYearId !== null) {
    const schoolYear = await findSchoolYearById(input.schoolYearId)
    if (!schoolYear) {
      throw new AppError(404, 'SCHOOL_YEAR_NOT_FOUND', 'Không tìm thấy năm học.')
    }
  }

  if (input.lecturerId !== null) {
    const lecturer = await findLecturerById(input.lecturerId)
    if (!lecturer) {
      throw new AppError(404, 'LECTURER_NOT_FOUND', 'Không tìm thấy giảng viên phụ trách.')
    }
  }

  const existing = await findActiveCourseOfferingByCode(input.classCode)
  if (existing) {
    throw new AppError(409, 'COURSE_OFFERING_CODE_EXISTS', 'Mã lớp học phần đã tồn tại.')
  }

  const created = await createCourseOffering({
    classCode: input.classCode,
    className: input.className,
    subjectId: input.subjectId,
    lecturerId: input.lecturerId,
    academicYearId: input.academicYearId,
    schoolYearId: input.schoolYearId,
    semester: input.semester,
    maxStudents: input.maxStudents,
    createdBy: userId,
  })

  return { courseOffering: mapCourseOffering(created) }
}

export async function updateCourseOfferingRecord(
  classId: bigint,
  userId: bigint | null,
  input: ReturnType<typeof validateCourseOfferingPayload>,
) {
  const current = await findCourseOfferingById(classId)
  if (!current) {
    throw new AppError(404, 'COURSE_OFFERING_NOT_FOUND', 'Không tìm thấy lớp học phần.')
  }

  const subject = await findSubjectById(input.subjectId)
  if (!subject) {
    throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Không tìm thấy môn học.')
  }

  const academicYear = await findAcademicYearById(input.academicYearId)
  if (!academicYear) {
    throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Không tìm thấy niên khoá.')
  }

  if (input.schoolYearId !== null) {
    const schoolYear = await findSchoolYearById(input.schoolYearId)
    if (!schoolYear) {
      throw new AppError(404, 'SCHOOL_YEAR_NOT_FOUND', 'Không tìm thấy năm học.')
    }
  }

  if (input.lecturerId !== null) {
    const lecturer = await findLecturerById(input.lecturerId)
    if (!lecturer) {
      throw new AppError(404, 'LECTURER_NOT_FOUND', 'Không tìm thấy giảng viên phụ trách.')
    }
  }

  const existing = await findActiveCourseOfferingByCode(input.classCode)
  if (existing && existing.classId !== classId) {
    throw new AppError(409, 'COURSE_OFFERING_CODE_EXISTS', 'Mã lớp học phần đã tồn tại.')
  }

  if (input.maxStudents !== null && input.maxStudents < current.currentEnrollment) {
    throw new AppError(
      409,
      'COURSE_OFFERING_MAX_STUDENTS_INVALID',
      'Sĩ số tối đa không được nhỏ hơn số lượng đã đăng ký.',
    )
  }

  const updated = await updateCourseOffering({
    classId,
    classCode: input.classCode,
    className: input.className,
    subjectId: input.subjectId,
    lecturerId: input.lecturerId,
    academicYearId: input.academicYearId,
    schoolYearId: input.schoolYearId,
    semester: input.semester,
    maxStudents: input.maxStudents,
    updatedBy: userId,
  })

  return { courseOffering: mapCourseOffering(updated) }
}
