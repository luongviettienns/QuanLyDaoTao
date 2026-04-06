import { apiFetch } from './http'

export type DepartmentOption = {
  departmentId: string
  departmentCode: string
  departmentName: string
  facultyId: string
  facultyName?: string | null
  description?: string | null
  isActive?: boolean
}

export type SubjectItem = {
  subjectId: string
  subjectCode: string
  subjectName: string
  credits: number
  description?: string | null
  departmentId?: string | null
  departmentName?: string | null
  isActive?: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export type SubjectPayload = {
  subjectId?: string
  subjectCode: string
  subjectName: string
  credits: number
  description?: string
  departmentId: string
}

type PagedResponse<T> = {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getSubjects(params: {
  page: number
  pageSize: number
  search?: string
  departmentId?: string
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  })

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (params.departmentId) {
    query.set('departmentId', params.departmentId)
  }

  return apiFetch<PagedResponse<SubjectItem>>(`/api-edu/subjects?${query.toString()}`)
}

export async function getSubjectById(subjectId: string) {
  return apiFetch<SubjectItem>(`/api-edu/subjects/${subjectId}`)
}

export async function createSubject(payload: SubjectPayload) {
  return apiFetch<SubjectItem>('/api-edu/subjects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSubject(subjectId: string, payload: SubjectPayload) {
  return apiFetch<void>(`/api-edu/subjects/${subjectId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      subjectId,
    }),
  })
}

export async function deleteSubject(subjectId: string) {
  return apiFetch<void>(`/api-edu/subjects/${subjectId}`, {
    method: 'DELETE',
  })
}

export async function getDepartments() {
  const response = await apiFetch<PagedResponse<DepartmentOption>>('/api-edu/departments?page=1&pageSize=200')
  return response.data
}
