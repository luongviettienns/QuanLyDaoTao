import { prisma } from '../database.js'

export async function findSubjects() {
  return prisma.subject.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ subjectCode: 'asc' }],
    select: {
      subjectId: true,
      subjectCode: true,
      subjectName: true,
      credits: true,
      departmentId: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true,
        },
      },
    },
  })
}

export async function findSubjectById(subjectId: bigint) {
  return prisma.subject.findFirst({
    where: {
      subjectId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      subjectId: true,
      subjectCode: true,
      subjectName: true,
      credits: true,
      departmentId: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true,
        },
      },
    },
  })
}

export async function findDepartmentById(departmentId: bigint) {
  return prisma.department.findFirst({
    where: {
      departmentId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      departmentId: true,
      departmentCode: true,
      departmentName: true,
    },
  })
}

export async function findActiveSubjectByCode(subjectCode: string) {
  return prisma.subject.findFirst({
    where: {
      subjectCode,
      deletedAt: null,
      isActive: true,
    },
    select: {
      subjectId: true,
      subjectCode: true,
    },
  })
}

export async function countClassesUsingSubject(subjectId: bigint) {
  return prisma.class.count({
    where: {
      subjectId,
      deletedAt: null,
    },
  })
}

export async function createSubject(params: {
  subjectCode: string
  subjectName: string
  credits: number
  departmentId: bigint
  description: string | null
  createdBy: bigint | null
}) {
  return prisma.subject.create({
    data: {
      subjectCode: params.subjectCode,
      subjectName: params.subjectName,
      credits: params.credits,
      departmentId: params.departmentId,
      description: params.description,
      createdBy: params.createdBy,
    },
    select: {
      subjectId: true,
      subjectCode: true,
      subjectName: true,
      credits: true,
      description: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true,
        },
      },
    },
  })
}

export async function updateSubject(params: {
  subjectId: bigint
  subjectCode: string
  subjectName: string
  credits: number
  departmentId: bigint
  description: string | null
  updatedBy: bigint | null
}) {
  return prisma.subject.update({
    where: { subjectId: params.subjectId },
    data: {
      subjectCode: params.subjectCode,
      subjectName: params.subjectName,
      credits: params.credits,
      departmentId: params.departmentId,
      description: params.description,
      updatedAt: new Date(),
      updatedBy: params.updatedBy,
    },
    select: {
      subjectId: true,
      subjectCode: true,
      subjectName: true,
      credits: true,
      description: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true,
        },
      },
    },
  })
}

export async function softDeleteSubject(subjectId: bigint, deletedBy: bigint | null) {
  return prisma.subject.update({
    where: { subjectId },
    data: {
      isActive: false,
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
      updatedBy: deletedBy,
    },
  })
}
