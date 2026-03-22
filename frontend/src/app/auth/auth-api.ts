import { appConfig } from '@/config/env'
import type {
  ApiErrorResponse,
  AuthUser,
  BackendAuthUser,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from './auth-types'
import type { AppRole } from './roles'

const base = appConfig.backendBaseUrl.replace(/\/$/, '')

function mapBackendRoleToAppRole(roleName: string): AppRole {
  switch (roleName) {
    case 'Admin':
      return 'admin'
    case 'Giảng viên':
      return 'lecturer'
    case 'Cố vấn':
      return 'advisor'
    case 'Sinh viên':
      return 'student'
    default:
      throw new Error(`Unsupported backend role: ${roleName}`)
  }
}

export function toAuthUser(user: Omit<AuthUser, 'appRole'>): AuthUser {
  return {
    ...user,
    appRole: mapBackendRoleToAppRole(user.role.name),
  }
}

async function parseJson<T>(response: Response): Promise<T | ApiErrorResponse> {
  return response.json() as Promise<T | ApiErrorResponse>
}

export async function loginWithPassword(payload: LoginPayload): Promise<{ accessToken: string; expiresIn: number; user: AuthUser }> {
  const response = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const json = await parseJson<LoginResponse>(response)

  if (!response.ok || !json.success) {
    const err = json as ApiErrorResponse
    throw new Error(err.message || 'Đăng nhập thất bại.')
  }

  const data = json.data

  return {
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    user: toAuthUser(data.user),
  }
}

export async function fetchMe(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })

  const json = await parseJson<MeResponse>(response)

  if (!response.ok || !json.success) {
    const err = json as ApiErrorResponse
    throw new Error(err.message || 'Không tải được thông tin tài khoản.')
  }

  return toAuthUser(json.data.user)
}

export async function postRefresh(): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  const json = await parseJson<RefreshResponse>(response)

  if (!response.ok || !json.success) {
    const err = json as ApiErrorResponse
    throw new Error(err.message || 'Làm mới phiên thất bại.')
  }

  return {
    accessToken: json.data.accessToken,
    expiresIn: json.data.expiresIn,
  }
}

export async function postLogout(): Promise<void> {
  await fetch(`${base}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function postLogoutAll(accessToken: string): Promise<void> {
  const response = await fetch(`${base}/auth/logout-all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })

  if (!response.ok) {
    const json = await parseJson<ApiErrorResponse>(response)
    throw new Error((json as ApiErrorResponse).message || 'Đăng xuất tất cả thiết bị thất bại.')
  }
}

export type { BackendAuthUser }
