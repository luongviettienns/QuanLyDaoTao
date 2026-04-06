import { apiFetch } from './http'

export type RegistrationPeriod = {
  periodId: string
  periodName: string
  academicYearId: string
  academicYearName?: string
  startYear?: number | null
  endYear?: number | null
  semester: number
  startDate: string
  endDate: string
  status: string
  periodType: string
  description?: string | null
  totalEnrollments?: number | null
  totalStudentsEnrolled?: number | null
  isActive: boolean
  createdAt: string
  createdBy?: string | null
}

export type DashboardSummary = {
  subjectCount: number
  classCount: number
  administrativeClassCount: number
  openRegistrationPeriodCount: number
  openRegistrationPeriods: RegistrationPeriod[]
}

type PagedResponse<T> = {
  data: T[]
  totalCount: number
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [subjects, classes, adminClasses, periods] = await Promise.all([
    apiFetch<PagedResponse<unknown>>('/api-edu/subjects?page=1&pageSize=1'),
    apiFetch<PagedResponse<unknown>>('/api-edu/classes?page=1&pageSize=1'),
    apiFetch<PagedResponse<unknown>>('/api-edu/admin-classes?page=1&pageSize=1'),
    apiFetch<PagedResponse<RegistrationPeriod>>('/api-edu/registration-periods'),
  ])

  const openRegistrationPeriods = periods.data.filter((item) => item.status === 'OPEN')

  return {
    subjectCount: subjects.totalCount,
    classCount: classes.totalCount,
    administrativeClassCount: adminClasses.totalCount,
    openRegistrationPeriodCount: openRegistrationPeriods.length,
    openRegistrationPeriods,
  }
}
