import { authorizedFetch } from '@/lib/authorized-fetch'
import { parseApiEnvelope } from '@/lib/parse-api-envelope'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:4000/api/v1'

export type DepartmentItem = {
  id: string
  code: string
  name: string
}

export type SubjectItem = {
  id: string
  subjectCode: string
  subjectName: string
  credits: number
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  department: DepartmentItem
}

export type CreateSubjectPayload = {
  subjectCode: string
  subjectName: string
  credits: number
  departmentId: string
  description: string | null
}

export type UpdateSubjectPayload = CreateSubjectPayload

export async function getSubjectsApi() {
  const response = await authorizedFetch(`${API_BASE_URL}/subjects`, { method: 'GET' })
  return parseApiEnvelope<{ items: SubjectItem[] }>(response)
}

export async function getDepartmentsApi() {
  const response = await authorizedFetch(`${API_BASE_URL}/academic/departments`, { method: 'GET' })
  return parseApiEnvelope<{ items: DepartmentItem[] }>(response)
}

export async function createSubjectApi(payload: CreateSubjectPayload) {
  const response = await authorizedFetch(`${API_BASE_URL}/subjects`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return parseApiEnvelope<{ subject: SubjectItem }>(response)
}

export async function getSubjectByIdApi(subjectId: string) {
  const response = await authorizedFetch(`${API_BASE_URL}/subjects/${subjectId}`, { method: 'GET' })
  return parseApiEnvelope<{ subject: SubjectItem }>(response)
}

export async function updateSubjectApi(subjectId: string, payload: UpdateSubjectPayload) {
  const response = await authorizedFetch(`${API_BASE_URL}/subjects/${subjectId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return parseApiEnvelope<{ subject: SubjectItem }>(response)
}

export async function deleteSubjectApi(subjectId: string) {
  const response = await authorizedFetch(`${API_BASE_URL}/subjects/${subjectId}`, { method: 'DELETE' })
  return parseApiEnvelope<{ ok: boolean }>(response)
}
