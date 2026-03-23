import { apiClient } from '@/lib/api-client'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

async function readJson<T>(path: string): Promise<T> {
  const response = await apiClient(path)
  const payload = (await response.json()) as ApiEnvelope<T> | { message?: string }

  if (!response.ok) {
    throw new Error('message' in payload && payload.message ? payload.message : 'Không thể tải dữ liệu.')
  }

  if (!('data' in payload)) {
    throw new Error('Phản hồi API không hợp lệ.')
  }

  return payload.data
}

export type SubjectItem = {
  id: string
  subjectCode: string
  subjectName: string
  credits: number
  description: string | null
  isActive: boolean
  department: {
    id: string
    code: string
    name: string
  }
}

export type AdministrativeClassItem = {
  id: string
  classCode: string
  className: string
  cohortYear: number | null
  maxStudents: number | null
  currentStudents: number
  description: string | null
  isActive: boolean
  major: {
    id: string
    code: string
    name: string
  }
  academicYear: {
    id: string
    yearName: string
    cohortCode: string | null
  }
  advisor: {
    id: string
    code: string
    fullName: string
  } | null
}

export type AcademicYearItem = {
  id: string
  yearName: string
  cohortCode: string | null
  startYear: number
  endYear: number
  durationYears: number
  isActive: boolean
}

export type SchoolYearItem = {
  id: string
  yearCode: string
  yearName: string
  startDate: string
  endDate: string
  currentSemester: number | null
  currentSemesterLabel: string | null
  academicYear: {
    id: string
    yearName: string
    cohortCode: string | null
  }
}

export type SemesterMetadataItem = {
  value: number
  label: string
}

export type CourseOfferingItem = {
  id: string
  classCode: string
  className: string
  semester: number | null
  semesterLabel: string | null
  maxStudents: number | null
  currentEnrollment: number
  isActive?: boolean
  subject: {
    id: string
    subjectCode: string
    subjectName: string
    credits: number
  }
  lecturer: {
    id: string
    code: string
    fullName: string
  } | null
  academicYear: {
    id: string
    yearName: string
    cohortCode: string | null
  }
  schoolYear: {
    id: string
    yearCode: string
    yearName: string
  } | null
}

export type RegistrationPeriodItem = {
  id: string
  periodName: string
  semester: number
  semesterLabel: string
  startDate: string
  endDate: string
  status: 'UPCOMING' | 'OPEN' | 'CLOSED'
  periodType: 'NORMAL' | 'RETAKE'
  description?: string | null
  academicYear: {
    id: string
    yearName: string
    cohortCode: string | null
  }
}

export type EnrollmentItem = {
  id: string
  enrollmentDate: string
  enrollmentStatus: string
  dropDeadline: string | null
  courseOffering: {
    id: string
    classCode: string
    className: string
    semester: number | null
    semesterLabel: string | null
    maxStudents: number | null
    currentEnrollment: number
    subject: {
      id: string
      subjectCode: string
      subjectName: string
      credits: number
    }
    lecturer: {
      id: string
      code: string
      fullName: string
    } | null
    academicYear: {
      id: string
      yearName: string
      cohortCode: string | null
    }
    schoolYear: {
      id: string
      yearCode: string
      yearName: string
    } | null
  }
}

export async function getSubjects() {
  return readJson<{ items: SubjectItem[] }>('/subjects')
}

export async function getAdministrativeClasses() {
  return readJson<{ items: AdministrativeClassItem[] }>('/administrative-classes')
}

export async function getAcademicYears() {
  return readJson<{ items: AcademicYearItem[] }>('/academic/academic-years')
}

export async function getSchoolYears() {
  return readJson<{ items: SchoolYearItem[] }>('/academic/school-years')
}

export async function getSemesterMetadata() {
  return readJson<{ items: SemesterMetadataItem[] }>('/academic/semesters/metadata')
}

export async function getCourseOfferings() {
  return readJson<{ items: CourseOfferingItem[] }>('/course-offerings')
}

export async function getRegistrationPeriods() {
  return readJson<{ items: RegistrationPeriodItem[] }>('/registration-periods')
}

export async function getCurrentRegistrationPeriod() {
  return readJson<{ registrationPeriod: RegistrationPeriodItem | null }>('/registration-periods/current')
}

export async function getMyEnrollments() {
  return readJson<{
    student: {
      id: string
      studentCode: string
      fullName: string
    }
    items: EnrollmentItem[]
  }>('/me/enrollments')
}
