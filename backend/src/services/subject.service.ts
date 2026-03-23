import { z } from 'zod'
import { AppError } from '../utils/app-error.js'
import {
  countClassesUsingSubject,
  createSubject,
  findActiveSubjectByCode,
  findDepartmentById,
  findSubjectById,
  findSubjects,
  softDeleteSubject,
  updateSubject,
} from '../repositories/subject.repository.js'

const subjectPayloadSchema = z.object({
  subjectCode: z.string().trim().min(1, 'subjectCode is required').max(50, 'subjectCode is too long'),
  subjectName: z.string().trim().min(1, 'subjectName is required').max(255, 'subjectName is too long'),
  credits: z.number().int().min(1, 'credits must be at least 1').max(50, 'credits is too large'),
  departmentId: z.coerce.bigint(),
  description: z.string().trim().max(500, 'description is too long').nullable().optional(),
})

function mapSubject(item: Awaited<ReturnType<typeof findSubjectById>> extends infer T
  ? T extends null
    ? never
    : T
  : never) {
  return {
    id: item.subjectId.toString(),
    subjectCode: item.subjectCode,
    subjectName: item.subjectName,
    credits: item.credits,
    description: item.description,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt?.toISOString() ?? null,
    department: {
      id: item.department.departmentId.toString(),
      code: item.department.departmentCode,
      name: item.department.departmentName,
    },
  }
}

export function validateSubjectPayload(input: unknown) {
  const result = subjectPayloadSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu môn học không hợp lệ.', result.error.flatten())
  }

  return {
    ...result.data,
    subjectCode: result.data.subjectCode.trim(),
    subjectName: result.data.subjectName.trim(),
    description: result.data.description?.trim() || null,
  }
}

export async function getSubjects() {
  const items = await findSubjects()

  return {
    items: items.map((item) => ({
      id: item.subjectId.toString(),
      subjectCode: item.subjectCode,
      subjectName: item.subjectName,
      credits: item.credits,
      description: item.description,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt?.toISOString() ?? null,
      department: {
        id: item.department.departmentId.toString(),
        code: item.department.departmentCode,
        name: item.department.departmentName,
      },
    })),
  }
}

export async function getSubjectDetail(subjectId: bigint) {
  const item = await findSubjectById(subjectId)

  if (!item) {
    throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Không tìm thấy môn học.')
  }

  return { subject: mapSubject(item) }
}

export async function createSubjectRecord(userId: bigint | null, input: ReturnType<typeof validateSubjectPayload>) {
  const department = await findDepartmentById(input.departmentId)

  if (!department) {
    throw new AppError(404, 'DEPARTMENT_NOT_FOUND', 'Không tìm thấy bộ môn/khoa quản lý.')
  }

  const existing = await findActiveSubjectByCode(input.subjectCode)
  if (existing) {
    throw new AppError(409, 'SUBJECT_CODE_EXISTS', 'Mã môn học đã tồn tại.')
  }

  const created = await createSubject({
    subjectCode: input.subjectCode,
    subjectName: input.subjectName,
    credits: input.credits,
    departmentId: input.departmentId,
    description: input.description,
    createdBy: userId,
  })

  return {
    subject: {
      id: created.subjectId.toString(),
      subjectCode: created.subjectCode,
      subjectName: created.subjectName,
      credits: created.credits,
      description: created.description,
      department: {
        id: created.department.departmentId.toString(),
        code: created.department.departmentCode,
        name: created.department.departmentName,
      },
    },
  }
}

export async function updateSubjectRecord(
  subjectId: bigint,
  userId: bigint | null,
  input: ReturnType<typeof validateSubjectPayload>,
) {
  const current = await findSubjectById(subjectId)
  if (!current) {
    throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Không tìm thấy môn học.')
  }

  const department = await findDepartmentById(input.departmentId)
  if (!department) {
    throw new AppError(404, 'DEPARTMENT_NOT_FOUND', 'Không tìm thấy bộ môn/khoa quản lý.')
  }

  const existing = await findActiveSubjectByCode(input.subjectCode)
  if (existing && existing.subjectId !== subjectId) {
    throw new AppError(409, 'SUBJECT_CODE_EXISTS', 'Mã môn học đã tồn tại.')
  }

  const updated = await updateSubject({
    subjectId,
    subjectCode: input.subjectCode,
    subjectName: input.subjectName,
    credits: input.credits,
    departmentId: input.departmentId,
    description: input.description,
    updatedBy: userId,
  })

  return {
    subject: {
      id: updated.subjectId.toString(),
      subjectCode: updated.subjectCode,
      subjectName: updated.subjectName,
      credits: updated.credits,
      description: updated.description,
      department: {
        id: updated.department.departmentId.toString(),
        code: updated.department.departmentCode,
        name: updated.department.departmentName,
      },
    },
  }
}

export async function deleteSubjectRecord(subjectId: bigint, userId: bigint | null) {
  const current = await findSubjectById(subjectId)
  if (!current) {
    throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Không tìm thấy môn học.')
  }

  const classCount = await countClassesUsingSubject(subjectId)
  if (classCount > 0) {
    throw new AppError(409, 'SUBJECT_IN_USE', 'Không thể xoá môn học đang được dùng ở lớp học phần.')
  }

  await softDeleteSubject(subjectId, userId)

  return { ok: true }
}
