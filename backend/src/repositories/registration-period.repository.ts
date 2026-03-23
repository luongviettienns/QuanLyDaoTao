import { prisma } from '../database.js'

export async function findRegistrationPeriods() {
  return prisma.registrationPeriod.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ startDate: 'desc' }, { periodId: 'desc' }],
    select: {
      periodId: true,
      periodName: true,
      academicYearId: true,
      semester: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
    },
  })
}

export async function findRegistrationPeriodById(periodId: bigint) {
  return prisma.registrationPeriod.findFirst({
    where: {
      periodId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      periodId: true,
      periodName: true,
      academicYearId: true,
      semester: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
    },
  })
}

export async function findOpenRegistrationPeriod(academicYearId: bigint, semester: number, periodType: string) {
  return prisma.registrationPeriod.findFirst({
    where: {
      academicYearId,
      semester,
      periodType,
      status: 'OPEN',
      deletedAt: null,
      isActive: true,
    },
    select: {
      periodId: true,
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

export async function createRegistrationPeriod(params: {
  periodName: string
  academicYearId: bigint
  semester: number
  startDate: Date
  endDate: Date
  status: string
  periodType: string
  description: string | null
  createdBy: bigint | null
}) {
  return prisma.registrationPeriod.create({
    data: {
      periodName: params.periodName,
      academicYearId: params.academicYearId,
      semester: params.semester,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status,
      periodType: params.periodType,
      description: params.description,
      createdBy: params.createdBy,
    },
    select: {
      periodId: true,
      periodName: true,
      academicYearId: true,
      semester: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
    },
  })
}

export async function updateRegistrationPeriod(params: {
  periodId: bigint
  periodName: string
  academicYearId: bigint
  semester: number
  startDate: Date
  endDate: Date
  status: string
  periodType: string
  description: string | null
  updatedBy: bigint | null
}) {
  return prisma.registrationPeriod.update({
    where: { periodId: params.periodId },
    data: {
      periodName: params.periodName,
      academicYearId: params.academicYearId,
      semester: params.semester,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status,
      periodType: params.periodType,
      description: params.description,
      updatedAt: new Date(),
      updatedBy: params.updatedBy,
    },
    select: {
      periodId: true,
      periodName: true,
      academicYearId: true,
      semester: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
    },
  })
}

export async function updateRegistrationPeriodStatus(periodId: bigint, status: string, updatedBy: bigint | null) {
  return prisma.registrationPeriod.update({
    where: { periodId },
    data: {
      status,
      updatedAt: new Date(),
      updatedBy,
    },
    select: {
      periodId: true,
      periodName: true,
      status: true,
      semester: true,
      periodType: true,
      startDate: true,
      endDate: true,
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
    },
  })
}

export async function findCourseOfferingById(classId: bigint) {
  return prisma.class.findFirst({
    where: {
      classId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      classId: true,
      classCode: true,
      className: true,
      academicYearId: true,
      semester: true,
      subject: {
        select: {
          subjectId: true,
          subjectCode: true,
          subjectName: true,
        },
      },
    },
  })
}

export async function findPeriodClass(periodId: bigint, classId: bigint) {
  return prisma.periodClass.findFirst({
    where: {
      periodId,
      classId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      periodClassId: true,
    },
  })
}

export async function attachClassToPeriod(periodId: bigint, classId: bigint, createdBy: bigint | null) {
  return prisma.periodClass.create({
    data: {
      periodId,
      classId,
      createdBy,
    },
    select: {
      periodClassId: true,
      registrationPeriod: {
        select: {
          periodId: true,
          periodName: true,
          semester: true,
          status: true,
        },
      },
      class: {
        select: {
          classId: true,
          classCode: true,
          className: true,
        },
      },
    },
  })
}

export async function detachClassFromPeriod(periodId: bigint, classId: bigint, deletedBy: bigint | null) {
  return prisma.periodClass.updateMany({
    where: {
      periodId,
      classId,
      deletedAt: null,
      isActive: true,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
      updatedBy: deletedBy,
    },
  })
}

export async function findCourseOfferingsByPeriodId(periodId: bigint) {
  return prisma.periodClass.findMany({
    where: {
      periodId,
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ class: { classCode: 'asc' } }],
    select: {
      periodClassId: true,
      class: {
        select: {
          classId: true,
          classCode: true,
          className: true,
          semester: true,
          maxStudents: true,
          currentEnrollment: true,
          subject: {
            select: {
              subjectId: true,
              subjectCode: true,
              subjectName: true,
              credits: true,
            },
          },
          lecturer: {
            select: {
              lecturerId: true,
              lecturerCode: true,
              fullName: true,
            },
          },
        },
      },
    },
  })
}
