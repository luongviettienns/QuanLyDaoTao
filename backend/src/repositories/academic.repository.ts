import { prisma } from '../database.js'

export async function findAcademicYears() {
  return prisma.academicYear.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ startYear: 'desc' }, { academicYearId: 'desc' }],
    select: {
      academicYearId: true,
      yearName: true,
      cohortCode: true,
      startYear: true,
      endYear: true,
      durationYears: true,
      isActive: true,
    },
  })
}

export async function findSchoolYears() {
  return prisma.schoolYear.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ startDate: 'desc' }, { schoolYearId: 'desc' }],
    select: {
      schoolYearId: true,
      yearCode: true,
      yearName: true,
      startDate: true,
      endDate: true,
      currentSemester: true,
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

export async function findDepartments() {
  return prisma.department.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ departmentCode: 'asc' }],
    select: {
      departmentId: true,
      departmentCode: true,
      departmentName: true,
    },
  })
}

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
      semester: true,
      startDate: true,
      endDate: true,
      status: true,
      periodType: true,
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
