import { prisma } from '../database.js'

export async function findCourseOfferings() {
  return prisma.class.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ createdAt: 'desc' }, { classId: 'desc' }],
    select: {
      classId: true,
      classCode: true,
      className: true,
      semester: true,
      maxStudents: true,
      currentEnrollment: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
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
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      schoolYear: {
        select: {
          schoolYearId: true,
          yearCode: true,
          yearName: true,
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
      semester: true,
      maxStudents: true,
      currentEnrollment: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
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
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      schoolYear: {
        select: {
          schoolYearId: true,
          yearCode: true,
          yearName: true,
        },
      },
    },
  })
}

export async function findActiveCourseOfferingByCode(classCode: string) {
  return prisma.class.findFirst({
    where: {
      classCode,
      deletedAt: null,
      isActive: true,
    },
    select: {
      classId: true,
      classCode: true,
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

export async function findSchoolYearById(schoolYearId: bigint) {
  return prisma.schoolYear.findFirst({
    where: {
      schoolYearId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      schoolYearId: true,
      yearCode: true,
      yearName: true,
    },
  })
}

export async function createCourseOffering(params: {
  classCode: string
  className: string
  subjectId: bigint
  lecturerId: bigint | null
  academicYearId: bigint
  schoolYearId: bigint | null
  semester: number | null
  maxStudents: number | null
  createdBy: bigint | null
}) {
  return prisma.class.create({
    data: {
      classCode: params.classCode,
      className: params.className,
      subjectId: params.subjectId,
      lecturerId: params.lecturerId,
      academicYearId: params.academicYearId,
      schoolYearId: params.schoolYearId,
      semester: params.semester,
      maxStudents: params.maxStudents,
      createdBy: params.createdBy,
    },
    select: {
      classId: true,
      classCode: true,
      className: true,
      semester: true,
      maxStudents: true,
      currentEnrollment: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
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
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      schoolYear: {
        select: {
          schoolYearId: true,
          yearCode: true,
          yearName: true,
        },
      },
    },
  })
}

export async function updateCourseOffering(params: {
  classId: bigint
  classCode: string
  className: string
  subjectId: bigint
  lecturerId: bigint | null
  academicYearId: bigint
  schoolYearId: bigint | null
  semester: number | null
  maxStudents: number | null
  updatedBy: bigint | null
}) {
  return prisma.class.update({
    where: { classId: params.classId },
    data: {
      classCode: params.classCode,
      className: params.className,
      subjectId: params.subjectId,
      lecturerId: params.lecturerId,
      academicYearId: params.academicYearId,
      schoolYearId: params.schoolYearId,
      semester: params.semester,
      maxStudents: params.maxStudents,
      updatedAt: new Date(),
      updatedBy: params.updatedBy,
    },
    select: {
      classId: true,
      classCode: true,
      className: true,
      semester: true,
      maxStudents: true,
      currentEnrollment: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
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
      academicYear: {
        select: {
          academicYearId: true,
          yearName: true,
          cohortCode: true,
        },
      },
      schoolYear: {
        select: {
          schoolYearId: true,
          yearCode: true,
          yearName: true,
        },
      },
    },
  })
}
