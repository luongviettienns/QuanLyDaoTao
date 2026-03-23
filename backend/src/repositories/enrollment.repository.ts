import { prisma } from '../database.js'

export async function findStudentProfileByUserId(userId: bigint) {
  return prisma.student.findFirst({
    where: {
      userId,
      deletedAt: null,
      isActive: true,
    },
    select: {
      studentId: true,
      studentCode: true,
      fullName: true,
    },
  })
}

export async function findEnrollmentsByStudentId(studentId: bigint) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      deletedAt: null,
    },
    orderBy: [{ enrollmentDate: 'desc' }, { enrollmentId: 'desc' }],
    select: {
      enrollmentId: true,
      enrollmentDate: true,
      enrollmentStatus: true,
      dropDeadline: true,
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
      },
    },
  })
}

export async function findCourseOfferingForEnrollment(classId: bigint) {
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
  })
}

export async function findOpenRegistrationPeriodForClass(classId: bigint, academicYearId: bigint, semester: number | null) {
  if (semester === null) {
    return null
  }

  return prisma.registrationPeriod.findFirst({
    where: {
      academicYearId,
      semester,
      status: 'OPEN',
      deletedAt: null,
      isActive: true,
      periodClasses: {
        some: {
          classId,
          deletedAt: null,
          isActive: true,
        },
      },
    },
    select: {
      periodId: true,
      periodName: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
    },
  })
}

export async function reactivateEnrollment(enrollmentId: bigint, classId: bigint) {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.update({
      where: { enrollmentId },
      data: {
        enrollmentStatus: 'APPROVED',
        updatedAt: new Date(),
      },
      select: {
        enrollmentId: true,
        enrollmentDate: true,
        enrollmentStatus: true,
      },
    })

    await tx.class.update({
      where: { classId },
      data: {
        currentEnrollment: {
          increment: 1,
        },
      },
    })

    return enrollment
  })
}

export async function findOpenRegistrationPeriodByClass(classId: bigint) {
  return prisma.registrationPeriod.findFirst({
    where: {
      status: 'OPEN',
      deletedAt: null,
      isActive: true,
      periodClasses: {
        some: {
          classId,
          deletedAt: null,
          isActive: true,
        },
      },
    },
    select: {
      periodId: true,
      periodName: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
    },
  })
}

export async function findAnyActiveEnrollmentByStudentAndClass(studentId: bigint, classId: bigint) {
  return prisma.enrollment.findFirst({
    where: {
      studentId,
      classId,
      deletedAt: null,
    },
    select: {
      enrollmentId: true,
      enrollmentStatus: true,
      classId: true,
    },
  })
}

export async function findCourseOfferingActiveEnrollmentCount(classId: bigint) {
  return prisma.enrollment.count({
    where: {
      classId,
      deletedAt: null,
      enrollmentStatus: {
        in: ['APPROVED', 'PENDING'],
      },
    },
  })
}

export async function syncCourseOfferingCurrentEnrollment(classId: bigint) {
  const activeCount = await findCourseOfferingActiveEnrollmentCount(classId)

  await prisma.class.update({
    where: { classId },
    data: {
      currentEnrollment: activeCount,
      updatedAt: new Date(),
    },
  })

  return activeCount
}

export async function findRegistrationPeriodClassLink(periodId: bigint, classId: bigint) {
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

export async function findCourseOfferingBySubjectInSemester(studentId: bigint, subjectId: bigint, academicYearId: bigint, semester: number | null) {
  if (semester === null) {
    return null
  }

  return prisma.enrollment.findFirst({
    where: {
      studentId,
      deletedAt: null,
      enrollmentStatus: {
        in: ['APPROVED', 'PENDING'],
      },
      class: {
        deletedAt: null,
        isActive: true,
        subjectId,
        academicYearId,
        semester,
      },
    },
    select: {
      enrollmentId: true,
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
      academicYearId: true,
      currentEnrollment: true,
      maxStudents: true,
      subjectId: true,
    },
  })
}

export async function findOpenRegistrationPeriodByPeriodId(periodId: bigint) {
  return prisma.registrationPeriod.findFirst({
    where: {
      periodId,
      status: 'OPEN',
      deletedAt: null,
      isActive: true,
    },
    select: {
      periodId: true,
      periodName: true,
      startDate: true,
      endDate: true,
      semester: true,
      academicYearId: true,
      periodType: true,
    },
  })
}

export async function findPeriodClassByClassId(classId: bigint) {
  return prisma.periodClass.findFirst({
    where: {
      classId,
      deletedAt: null,
      isActive: true,
      registrationPeriod: {
        deletedAt: null,
        isActive: true,
      },
    },
    select: {
      periodId: true,
      registrationPeriod: {
        select: {
          periodId: true,
          periodName: true,
          status: true,
          startDate: true,
          endDate: true,
          semester: true,
          academicYearId: true,
          periodType: true,
        },
      },
    },
  })
}

export async function findAllOpenPeriodsByAcademicYearSemester(academicYearId: bigint, semester: number | null) {
  if (semester === null) {
    return []
  }

  return prisma.registrationPeriod.findMany({
    where: {
      academicYearId,
      semester,
      status: 'OPEN',
      deletedAt: null,
      isActive: true,
    },
    select: {
      periodId: true,
      periodName: true,
      periodType: true,
    },
  })
}

export async function findClassLinksForOpenPeriods(classId: bigint, academicYearId: bigint, semester: number | null) {
  if (semester === null) {
    return []
  }

  return prisma.periodClass.findMany({
    where: {
      classId,
      deletedAt: null,
      isActive: true,
      registrationPeriod: {
        academicYearId,
        semester,
        status: 'OPEN',
        deletedAt: null,
        isActive: true,
      },
    },
    select: {
      periodId: true,
      registrationPeriod: {
        select: {
          periodId: true,
          periodName: true,
          startDate: true,
          endDate: true,
          status: true,
          periodType: true,
        },
      },
    },
  })
}

export async function findWithdrawnOrDroppedEnrollmentByStudentAndClass(studentId: bigint, classId: bigint) {
  return prisma.enrollment.findFirst({
    where: {
      studentId,
      classId,
      deletedAt: null,
      enrollmentStatus: {
        in: ['WITHDRAWN', 'DROPPED'],
      },
    },
    select: {
      enrollmentId: true,
      enrollmentStatus: true,
      classId: true,
      enrollmentDate: true,
    },
  })
}

export async function updateEnrollmentStatus(enrollmentId: bigint, status: string) {
  return prisma.enrollment.update({
    where: { enrollmentId },
    data: {
      enrollmentStatus: status,
      updatedAt: new Date(),
    },
    select: {
      enrollmentId: true,
      enrollmentDate: true,
      enrollmentStatus: true,
    },
  })
}

export async function findEnrollmentWithClassByIdAndStudent(enrollmentId: bigint, studentId: bigint) {
  return prisma.enrollment.findFirst({
    where: {
      enrollmentId,
      studentId,
      deletedAt: null,
    },
    select: {
      enrollmentId: true,
      classId: true,
      enrollmentStatus: true,
      enrollmentDate: true,
      class: {
        select: {
          classId: true,
          classCode: true,
          className: true,
          semester: true,
          academicYearId: true,
          currentEnrollment: true,
        },
      },
    },
  })
}

export async function findEnrollmentByStudentAndClass(studentId: bigint, classId: bigint) {
  return prisma.enrollment.findFirst({
    where: {
      studentId,
      classId,
      deletedAt: null,
    },
    select: {
      enrollmentId: true,
      enrollmentStatus: true,
    },
  })
}

export async function findEnrollmentByIdAndStudent(enrollmentId: bigint, studentId: bigint) {
  return prisma.enrollment.findFirst({
    where: {
      enrollmentId,
      studentId,
      deletedAt: null,
    },
    select: {
      enrollmentId: true,
      classId: true,
      enrollmentStatus: true,
      class: {
        select: {
          classId: true,
          currentEnrollment: true,
        },
      },
    },
  })
}

export async function createEnrollment(params: {
  studentId: bigint
  classId: bigint
  status: string
}) {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({
      data: {
        studentId: params.studentId,
        classId: params.classId,
        enrollmentStatus: params.status,
      },
      select: {
        enrollmentId: true,
        enrollmentDate: true,
        enrollmentStatus: true,
      },
    })

    await tx.class.update({
      where: { classId: params.classId },
      data: {
        currentEnrollment: {
          increment: 1,
        },
      },
    })

    return enrollment
  })
}

export async function withdrawEnrollment(enrollmentId: bigint, classId: bigint) {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.update({
      where: { enrollmentId },
      data: {
        enrollmentStatus: 'WITHDRAWN',
        updatedAt: new Date(),
      },
      select: {
        enrollmentId: true,
        enrollmentStatus: true,
      },
    })

    await tx.class.update({
      where: { classId },
      data: {
        currentEnrollment: {
          decrement: 1,
        },
      },
    })

    return enrollment
  })
}
