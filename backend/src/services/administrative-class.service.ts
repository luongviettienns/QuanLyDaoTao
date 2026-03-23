import { z } from 'zod'
import { AppError } from '../utils/app-error.js'
import {
  createAdministrativeClass,
  findAcademicYearById,
  findActiveAdministrativeClassByCode,
  findAdministrativeClassById,
  findAdministrativeClasses,
  findLecturerById,
  findMajorById,
  findStudentsByAdministrativeClassId,
  updateAdministrativeClass,
} from '../repositories/administrative-class.repository.js'

const administrativeClassPayloadSchema = z.object({
  classCode: z.string().trim().min(1, 'classCode is required').max(50, 'classCode is too long'),
  className: z.string().trim().min(1, 'className is required').max(255, 'className is too long'),
  majorId: z.coerce.bigint(),
  advisorId: z.union([z.coerce.bigint(), z.null()]).optional(),
  academicYearId: z.coerce.bigint(),
  cohortYear: z.union([z.number().int(), z.null()]).optional(),
  maxStudents: z.union([z.number().int().min(1), z.null()]).optional(),
  description: z.string().trim().max(500, 'description is too long').nullable().optional(),
})

function mapAdministrativeClass(item: Awaited<ReturnType<typeof findAdministrativeClassById>> extends infer T
  ? T extends null
    ? never
    : T
  : never) {
  return {
    id: item.adminClassId.toString(),
    classCode: item.classCode,
    className: item.className,
    cohortYear: item.cohortYear,
    maxStudents: item.maxStudents,
    currentStudents: item.currentStudents,
    description: item.description,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt?.toISOString() ?? null,
    major: {
      id: item.major.majorId.toString(),
      code: item.major.majorCode,
      name: item.major.majorName,
    },
    academicYear: {
      id: item.academicYear.academicYearId.toString(),
      yearName: item.academicYear.yearName,
      cohortCode: item.academicYear.cohortCode,
    },
    advisor: item.advisor
      ? {
          id: item.advisor.lecturerId.toString(),
          code: item.advisor.lecturerCode,
          fullName: item.advisor.fullName,
        }
      : null,
  }
}

export function validateAdministrativeClassPayload(input: unknown) {
  const result = administrativeClassPayloadSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu lớp hành chính không hợp lệ.', result.error.flatten())
  }

  return {
    ...result.data,
    classCode: result.data.classCode.trim(),
    className: result.data.className.trim(),
    advisorId: result.data.advisorId ?? null,
    cohortYear: result.data.cohortYear ?? null,
    maxStudents: result.data.maxStudents ?? null,
    description: result.data.description?.trim() || null,
  }
}

export async function getAdministrativeClasses() {
  const items = await findAdministrativeClasses()

  return {
    items: items.map((item) => ({
      id: item.adminClassId.toString(),
      classCode: item.classCode,
      className: item.className,
      cohortYear: item.cohortYear,
      maxStudents: item.maxStudents,
      currentStudents: item.currentStudents,
      description: item.description,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt?.toISOString() ?? null,
      major: {
        id: item.major.majorId.toString(),
        code: item.major.majorCode,
        name: item.major.majorName,
      },
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
      advisor: item.advisor
        ? {
            id: item.advisor.lecturerId.toString(),
            code: item.advisor.lecturerCode,
            fullName: item.advisor.fullName,
          }
        : null,
    })),
  }
}

export async function getAdministrativeClassDetail(adminClassId: bigint) {
  const item = await findAdministrativeClassById(adminClassId)

  if (!item) {
    throw new AppError(404, 'ADMIN_CLASS_NOT_FOUND', 'Không tìm thấy lớp hành chính.')
  }

  return { administrativeClass: mapAdministrativeClass(item) }
}

export async function getAdministrativeClassStudents(adminClassId: bigint) {
  const adminClass = await findAdministrativeClassById(adminClassId)
  if (!adminClass) {
    throw new AppError(404, 'ADMIN_CLASS_NOT_FOUND', 'Không tìm thấy lớp hành chính.')
  }

  const students = await findStudentsByAdministrativeClassId(adminClassId)

  return {
    administrativeClass: {
      id: adminClass.adminClassId.toString(),
      classCode: adminClass.classCode,
      className: adminClass.className,
    },
    students: students.map((student) => ({
      id: student.studentId.toString(),
      studentCode: student.studentCode,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      cohortYear: student.cohortYear,
      major: {
        id: student.major.majorId.toString(),
        code: student.major.majorCode,
        name: student.major.majorName,
      },
    })),
  }
}

export async function createAdministrativeClassRecord(
  userId: bigint | null,
  input: ReturnType<typeof validateAdministrativeClassPayload>,
) {
  const major = await findMajorById(input.majorId)
  if (!major) {
    throw new AppError(404, 'MAJOR_NOT_FOUND', 'Không tìm thấy ngành.')
  }

  const academicYear = await findAcademicYearById(input.academicYearId)
  if (!academicYear) {
    throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Không tìm thấy niên khoá.')
  }

  if (input.advisorId !== null) {
    const advisor = await findLecturerById(input.advisorId)
    if (!advisor) {
      throw new AppError(404, 'ADVISOR_NOT_FOUND', 'Không tìm thấy cố vấn học tập.')
    }
  }

  const existing = await findActiveAdministrativeClassByCode(input.classCode)
  if (existing) {
    throw new AppError(409, 'ADMIN_CLASS_CODE_EXISTS', 'Mã lớp hành chính đã tồn tại.')
  }

  const created = await createAdministrativeClass({
    classCode: input.classCode,
    className: input.className,
    majorId: input.majorId,
    advisorId: input.advisorId,
    academicYearId: input.academicYearId,
    cohortYear: input.cohortYear,
    maxStudents: input.maxStudents,
    description: input.description,
    createdBy: userId,
  })

  return {
    administrativeClass: {
      id: created.adminClassId.toString(),
      classCode: created.classCode,
      className: created.className,
      cohortYear: created.cohortYear,
      maxStudents: created.maxStudents,
      currentStudents: created.currentStudents,
      description: created.description,
      major: {
        id: created.major.majorId.toString(),
        code: created.major.majorCode,
        name: created.major.majorName,
      },
      academicYear: {
        id: created.academicYear.academicYearId.toString(),
        yearName: created.academicYear.yearName,
        cohortCode: created.academicYear.cohortCode,
      },
      advisor: created.advisor
        ? {
            id: created.advisor.lecturerId.toString(),
            code: created.advisor.lecturerCode,
            fullName: created.advisor.fullName,
          }
        : null,
    },
  }
}

export async function updateAdministrativeClassRecord(
  adminClassId: bigint,
  userId: bigint | null,
  input: ReturnType<typeof validateAdministrativeClassPayload>,
) {
  const current = await findAdministrativeClassById(adminClassId)
  if (!current) {
    throw new AppError(404, 'ADMIN_CLASS_NOT_FOUND', 'Không tìm thấy lớp hành chính.')
  }

  const major = await findMajorById(input.majorId)
  if (!major) {
    throw new AppError(404, 'MAJOR_NOT_FOUND', 'Không tìm thấy ngành.')
  }

  const academicYear = await findAcademicYearById(input.academicYearId)
  if (!academicYear) {
    throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Không tìm thấy niên khoá.')
  }

  if (input.advisorId !== null) {
    const advisor = await findLecturerById(input.advisorId)
    if (!advisor) {
      throw new AppError(404, 'ADVISOR_NOT_FOUND', 'Không tìm thấy cố vấn học tập.')
    }
  }

  const existing = await findActiveAdministrativeClassByCode(input.classCode)
  if (existing && existing.adminClassId !== adminClassId) {
    throw new AppError(409, 'ADMIN_CLASS_CODE_EXISTS', 'Mã lớp hành chính đã tồn tại.')
  }

  if (input.maxStudents !== null && input.maxStudents < current.currentStudents) {
    throw new AppError(
      409,
      'ADMIN_CLASS_MAX_STUDENTS_INVALID',
      'Sĩ số tối đa không được nhỏ hơn số sinh viên hiện tại.',
    )
  }

  const updated = await updateAdministrativeClass({
    adminClassId,
    classCode: input.classCode,
    className: input.className,
    majorId: input.majorId,
    advisorId: input.advisorId,
    academicYearId: input.academicYearId,
    cohortYear: input.cohortYear,
    maxStudents: input.maxStudents,
    description: input.description,
    updatedBy: userId,
  })

  return {
    administrativeClass: {
      id: updated.adminClassId.toString(),
      classCode: updated.classCode,
      className: updated.className,
      cohortYear: updated.cohortYear,
      maxStudents: updated.maxStudents,
      currentStudents: updated.currentStudents,
      description: updated.description,
      major: {
        id: updated.major.majorId.toString(),
        code: updated.major.majorCode,
        name: updated.major.majorName,
      },
      academicYear: {
        id: updated.academicYear.academicYearId.toString(),
        yearName: updated.academicYear.yearName,
        cohortCode: updated.academicYear.cohortCode,
      },
      advisor: updated.advisor
        ? {
            id: updated.advisor.lecturerId.toString(),
            code: updated.advisor.lecturerCode,
            fullName: updated.advisor.fullName,
          }
        : null,
    },
  }
}
