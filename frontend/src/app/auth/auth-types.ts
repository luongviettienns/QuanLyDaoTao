import type { AppRole } from './roles'

export type AuthUserProfile =
  | { type: 'admin' }
  | { type: 'lecturer'; lecturerId: string; lecturerCode: string }
  | { type: 'advisor'; lecturerId: string; lecturerCode: string }
  | { type: 'student'; studentId: string; studentCode: string }

export type AuthUser = {
  id: string
  username: string
  email: string
  fullName: string
  role: {
    id: string
    name: string
  }
  appRole: AppRole
  profile: AuthUserProfile
}

export type LoginPayload = {
  identifier: string
  password: string
  rememberMe: boolean
}

/** Backend user shape (no appRole) */
export type BackendAuthUser = Omit<AuthUser, 'appRole'>

export type LoginResponse = {
  success: true
  message: string
  data: {
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
    user: Omit<AuthUser, 'appRole'>
  }
}

export type MeResponse = {
  success: true
  message: string
  data: {
    user: Omit<AuthUser, 'appRole'>
  }
}

export type RefreshResponse = {
  success: true
  message: string
  data: {
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
  }
}

export type ApiErrorResponse = {
  success: false
  message: string
  code?: string
  details?: unknown
}
