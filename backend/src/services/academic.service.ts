import {
  findAcademicYears,
  findAdministrativeClasses,
  findCourseOfferings,
  findDepartments,
  findRegistrationPeriods,
  findSchoolYears,
  findSubjects,
} from '../repositories/academic.repository.js'

function mapSemesterLabel(semester: number | null) {
  if (semester === 1) return 'Học kỳ 1'
  if (semester === 2) return 'Học kỳ 2'
  if (semester === 3) return 'Học kỳ hè'
  return null
}

export async function getAcademicYearsData() {
  const academicYears = await findAcademicYears()

  return {
    items: academicYears.map((item) => ({
      id: item.academicYearId.toString(),
      yearName: item.yearName,
      cohortCode: item.cohortCode,
      startYear: item.startYear,
      endYear: item.endYear,
      durationYears: item.durationYears,
      isActive: item.isActive,
    })),
  }
}

export async function getSchoolYearsData() {
  const schoolYears = await findSchoolYears()

  return {
    items: schoolYears.map((item) => ({
      id: item.schoolYearId.toString(),
      yearCode: item.yearCode,
      yearName: item.yearName,
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      currentSemester: item.currentSemester,
      currentSemesterLabel: mapSemesterLabel(item.currentSemester),
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
    })),
  }
}

export async function getSemesterMetadata() {
  return {
    items: [
      { value: 1, label: 'Học kỳ 1' },
      { value: 2, label: 'Học kỳ 2' },
      { value: 3, label: 'Học kỳ hè' },
    ],
  }
}

export async function getRegistrationPeriodsData() {
  const registrationPeriods = await findRegistrationPeriods()

  return {
    items: registrationPeriods.map((item) => ({
      id: item.periodId.toString(),
      periodName: item.periodName,
      semester: item.semester,
      semesterLabel: mapSemesterLabel(item.semester),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      status: item.status,
      periodType: item.periodType,
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
    })),
  }
}

export async function getDepartmentsData() {
  const departments = await findDepartments()

  return {
    items: departments.map((item) => ({
      id: item.departmentId.toString(),
      code: item.departmentCode,
      name: item.departmentName,
    })),
  }
}

export async function getCurrentRegistrationPeriodData() {
  const registrationPeriods = await findRegistrationPeriods()
  const current = registrationPeriods.find((item) => item.status === 'OPEN') ?? null

  return {
    registrationPeriod: current
      ? {
          id: current.periodId.toString(),
          periodName: current.periodName,
          semester: current.semester,
          semesterLabel: mapSemesterLabel(current.semester),
          startDate: current.startDate.toISOString(),
          endDate: current.endDate.toISOString(),
          status: current.status,
          periodType: current.periodType,
          academicYear: {
            id: current.academicYear.academicYearId.toString(),
            yearName: current.academicYear.yearName,
            cohortCode: current.academicYear.cohortCode,
          },
        }
      : null,
  }
}

export async function getAcademicReferenceData() {
  const [academicYears, schoolYears, administrativeClasses, subjects, courseOfferings, registrationPeriods] =
    await Promise.all([
      findAcademicYears(),
      findSchoolYears(),
      findAdministrativeClasses(),
      findSubjects(),
      findCourseOfferings(),
      findRegistrationPeriods(),
    ])

  return {
    academicYears: academicYears.map((item) => ({
      id: item.academicYearId.toString(),
      yearName: item.yearName,
      cohortCode: item.cohortCode,
      startYear: item.startYear,
      endYear: item.endYear,
      durationYears: item.durationYears,
      isActive: item.isActive,
    })),
    schoolYears: schoolYears.map((item) => ({
      id: item.schoolYearId.toString(),
      yearCode: item.yearCode,
      yearName: item.yearName,
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      currentSemester: item.currentSemester,
      currentSemesterLabel: mapSemesterLabel(item.currentSemester),
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
    })),
    administrativeClasses: administrativeClasses.map((item) => ({
      id: item.adminClassId.toString(),
      classCode: item.classCode,
      className: item.className,
      cohortYear: item.cohortYear,
      maxStudents: item.maxStudents,
      currentStudents: item.currentStudents,
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
    subjects: subjects.map((item) => ({
      id: item.subjectId.toString(),
      subjectCode: item.subjectCode,
      subjectName: item.subjectName,
      credits: item.credits,
      department: {
        id: item.department.departmentId.toString(),
        code: item.department.departmentCode,
        name: item.department.departmentName,
      },
    })),
    courseOfferings: courseOfferings.map((item) => ({
      id: item.classId.toString(),
      classCode: item.classCode,
      className: item.className,
      semester: item.semester,
      semesterLabel: mapSemesterLabel(item.semester),
      maxStudents: item.maxStudents,
      currentEnrollment: item.currentEnrollment,
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
    registrationPeriods: registrationPeriods.map((item) => ({
      id: item.periodId.toString(),
      periodName: item.periodName,
      semester: item.semester,
      semesterLabel: mapSemesterLabel(item.semester),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      status: item.status,
      periodType: item.periodType,
      academicYear: {
        id: item.academicYear.academicYearId.toString(),
        yearName: item.academicYear.yearName,
        cohortCode: item.academicYear.cohortCode,
      },
    })),
  }
}
