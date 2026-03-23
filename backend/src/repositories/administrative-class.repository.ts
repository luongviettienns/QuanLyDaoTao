import { prisma } from '../database.js'

export async function findAdministrativeClasses() {
  return prisma.administrativeClass.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ classCode: 'asc' }],
    select: {
      adminClassId: true,
      classCode: true,
      className: true,
      cohortYear: true,
      maxStudents: true,
      currentStudents: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      major: {
        select: {
          majorId: true,
          majorCode: true,
          majorName: true,
        },
      },
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      advisor: {
        select: {
          lecturerId: true,
          lecturerCode: true,
          fullName: true,
        },
      },
    },
  })
}

export async function findAdministrativeClassById(adminClassId: bigint) {
  return prisma.administrativeClass.findFirst({
    where: {
      adminClassId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      adminClassId: true,
      classCode: true,
      className: true,
      cohortYear: true,
      maxStudents: true,
      currentStudents: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      major: {
        select: {
          majorId: true,
          majorCode: true,
          majorName: true,
        },
      },
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      advisor: {
        select: {
          lecturerId: true,
          lecturerCode: true,
          fullName: true,
        },
      },
    },
  })
}

export async function findActiveAdministrativeClassByCode(classCode: string) {
  return prisma.administrativeClass.findFirst({
    where: {
      classCode,
      deletedAt: null,
      isActive: true,
    },
    select: {
      adminClassId: true,
      classCode: true,
    },
  })
}

export async function findMajorById(majorId: bigint) {
  return prisma.major.findFirst({
    where: {
      majorId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      majorId: true,
      majorCode: true,
      majorName: true,
    },
  })
}

export async function findAcademicYearById(academicYearId: bigint) {
  return prisma.academicYear.findFirst({
    where: {
      academicYearId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      academicYearId: true,
      yearName: true,
      cohortCode: true,
    },
  })
}

export async function findLecturerById(lecturerId: bigint) {
  return prisma.lecturer.findFirst({
    where: {
      lecturerId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      lecturerId: true,
      lecturerCode: true,
      fullName: true,
    },
  })
}

export async function findStudentsByAdministrativeClassId(adminClassId: bigint) {
  return prisma.student.findMany({
    where: {
      adminClassId,
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ studentCode: 'asc' }],
    select: {
      studentId: true,
      studentCode: true,
      fullName: true,
      email: true,
      phone: true,
      cohortYear: true,
      major: {
        select: {
          majorId: true,
          majorCode: true,
          majorName: true,
        },
      },
    },
  })
}

export async function createAdministrativeClass(params: {
  classCode: string
  className: string
  majorId: bigint
  advisorId: bigint | null
  academicYearId: bigint
  cohortYear: number | null
  maxStudents: number | null
  description: string | null
  createdBy: bigint | null
}) {
  return prisma.administrativeClass.create({
    data: {
      classCode: params.classCode,
      className: params.className,
      majorId: params.majorId,
      advisorId: params.advisorId,
      academicYearId: params.academicYearId,
      cohortYear: params.cohortYear,
      maxStudents: params.maxStudents,
      description: params.description,
      createdBy: params.createdBy,
    },
    select: {
      adminClassId: true,
      classCode: true,
      className: true,
      cohortYear: true,
      maxStudents: true,
      currentStudents: true,
      description: true,
      major: {
        select: {
          majorId: true,
          majorCode: true,
          majorName: true,
        },
      },
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      advisor: {
        select: {
          lecturerId: true,
          lecturerCode: true,
          fullName: true,
        },
      },
    },
  })
}

export async function updateAdministrativeClass(params: {
  adminClassId: bigint
  classCode: string
  className: string
  majorId: bigint
  advisorId: bigint | null
  academicYearId: bigint
  cohortYear: number | null
  maxStudents: number | null
  description: string | null
  updatedBy: bigint | null
}) {
  return prisma.administrativeClass.update({
    where: { adminClassId: params.adminClassId },
    data: {
      classCode: params.classCode,
      className: params.className,
      majorId: params.majorId,
      advisorId: params.advisorId,
      academicYearId: params.academicYearId,
      cohortYear: params.cohortYear,
      maxStudents: params.maxStudents,
      description: params.description,
      updatedAt: new Date(),
      updatedBy: params.updatedBy,
    },
    select: {
      adminClassId: true,
      classCode: true,
      className: true,
      cohortYear: true,
      maxStudents: true,
      currentStudents: true,
      description: true,
      major: {
        select: {
          majorId: true,
          majorCode: true,
          majorName: true,
        },
      },
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      advisor: {
        select: {
          lecturerId: true,
          lecturerCode: true,
          fullName: true,
        },
      },
    },
  })
}
