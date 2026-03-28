import { authorizedFetch } from '@/lib/authorized-fetch'
import { parseApiEnvelope } from '@/lib/parse-api-envelope'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:4000/api/v1'

export type DashboardStats = {
  subjectCount: number
  courseOfferingCount: number
  administrativeClassCount: number
  openRegistrationPeriodCount: number
}

/** Tổng hợp số liệu từ các API sẵn có (không có endpoint dashboard riêng). */
export async function getDashboardStatsApi(): Promise<DashboardStats> {
  const [subjectsRes, offeringsRes, adminClassesRes, periodsRes] = await Promise.all([
    authorizedFetch(`${API_BASE_URL}/subjects`, { method: 'GET' }),
    authorizedFetch(`${API_BASE_URL}/course-offerings`, { method: 'GET' }),
    authorizedFetch(`${API_BASE_URL}/administrative-classes`, { method: 'GET' }),
    authorizedFetch(`${API_BASE_URL}/registration-periods`, { method: 'GET' }),
  ])

  const [subjectsData, offeringsData, adminData, periodsData] = await Promise.all([
    parseApiEnvelope<{ items: unknown[] }>(subjectsRes),
    parseApiEnvelope<{ items: unknown[] }>(offeringsRes),
    parseApiEnvelope<{ items: unknown[] }>(adminClassesRes),
    parseApiEnvelope<{
      items: { status: string }[]
    }>(periodsRes),
  ])

  const openRegistrationPeriodCount = periodsData.items.filter((p) => p.status === 'OPEN').length

  return {
    subjectCount: subjectsData.items.length,
    courseOfferingCount: offeringsData.items.length,
    administrativeClassCount: adminData.items.length,
    openRegistrationPeriodCount,
  }
}

export type RegistrationPeriodListItem = {
  id: string
  periodName: string
  semesterLabel: string
  startDate: string
  endDate: string
  status: string
  academicYear: { yearName: string; cohortCode: string }
}

export async function getRegistrationPeriodsListApi() {
  const response = await authorizedFetch(`${API_BASE_URL}/registration-periods`, { method: 'GET' })
  return parseApiEnvelope<{ items: RegistrationPeriodListItem[] }>(response)
}
