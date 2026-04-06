export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  refreshToken: string
  refreshTokenExpiry: string
  userId: string
  username: string
  role: string
  fullName: string
  avatarUrl: string
}

export type LoginApiEnvelope = {
  data: LoginResponse
}
