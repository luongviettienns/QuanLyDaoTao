import { randomUUID } from 'node:crypto'
import type { Request } from 'express'
import { z } from 'zod'
import { AUTH_ACTIONS, AUTH_ROLE_NAMES } from '../constants/auth.constants.js'
import { config } from '../config.js'
import { AppError } from '../utils/app-error.js'
import { comparePassword, generateOpaqueRefreshToken, hashRefreshToken } from '../utils/hash.js'
import { parseAccessExpiresInSeconds, parseDurationToMs } from '../utils/duration.js'
import { signAccessToken } from '../utils/jwt.js'
import {
  createAuditLog,
  createRefreshToken,
  findRefreshTokenByTokenHash,
  findUserByIdForMe,
  findUserForLogin,
  revokeAllActiveRefreshTokensForUser,
  revokeRefreshTokenById,
  rotateRefreshToken,
  updateLastLogin,
} from '../repositories/auth.repository.js'

type LoginUser = NonNullable<Awaited<ReturnType<typeof findUserForLogin>>>

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

type LoginInput = z.infer<typeof loginSchema>

type LoginProfile =
  | { type: 'admin' }
  | { type: 'lecturer'; lecturerId: string; lecturerCode: string }
  | { type: 'advisor'; lecturerId: string; lecturerCode: string }
  | { type: 'student'; studentId: string; studentCode: string }

export type LoginResult = {
  cookie: {
    name: string
    value: string
    maxAge: number
    options: {
      httpOnly: true
      sameSite: 'lax' | 'strict' | 'none'
      secure: boolean
      path: string
      signed: boolean
    }
  }
  body: {
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
    user: {
      id: string
      username: string
      email: string
      fullName: string
      role: {
        id: string
        name: string
      }
      profile: LoginProfile
    }
  }
}

export type AuthUserPayload = LoginResult['body']['user']

function resolveRoleProfile(roleName: string, user: LoginUser) {

  if (roleName === AUTH_ROLE_NAMES.ADMIN) {
    return { type: 'admin' } as const
  }

  if (roleName === AUTH_ROLE_NAMES.LECTURER) {
    if (!user.lecturerProfile || !user.lecturerProfile.isActive || user.lecturerProfile.deletedAt) {
      throw new AppError(403, 'PROFILE_NOT_READY', 'Tài khoản chưa có hồ sơ giảng viên hợp lệ.')
    }

    return {
      type: 'lecturer' as const,
      lecturerId: user.lecturerProfile.lecturerId.toString(),
      lecturerCode: user.lecturerProfile.lecturerCode,
    }
  }

  if (roleName === AUTH_ROLE_NAMES.ADVISOR) {
    if (!user.lecturerProfile || !user.lecturerProfile.isActive || user.lecturerProfile.deletedAt) {
      throw new AppError(403, 'PROFILE_NOT_READY', 'Tài khoản chưa có hồ sơ cố vấn hợp lệ.')
    }

    return {
      type: 'advisor' as const,
      lecturerId: user.lecturerProfile.lecturerId.toString(),
      lecturerCode: user.lecturerProfile.lecturerCode,
    }
  }

  if (roleName === AUTH_ROLE_NAMES.STUDENT) {
    if (!user.studentProfile || !user.studentProfile.isActive || user.studentProfile.deletedAt) {
      throw new AppError(403, 'PROFILE_NOT_READY', 'Tài khoản chưa có hồ sơ sinh viên hợp lệ.')
    }

    return {
      type: 'student' as const,
      studentId: user.studentProfile.studentId.toString(),
      studentCode: user.studentProfile.studentCode,
    }
  }

  throw new AppError(403, 'ROLE_NOT_SUPPORTED', 'Vai trò hiện tại chưa được hỗ trợ đăng nhập.')
}

function buildAuthUserPayload(user: LoginUser): AuthUserPayload {
  const profile = resolveRoleProfile(user.role.roleName, user)

  return {
    id: user.userId.toString(),
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: {
      id: user.role.roleId.toString(),
      name: user.role.roleName,
    },
    profile,
  }
}

function getRefreshCookieBaseOptions() {
  return {
    httpOnly: true as const,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: config.refreshTokenCookiePath,
    signed: false as const,
  }
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0]?.trim() || null
  }

  return request.ip || null
}

export function validateLoginInput(input: unknown): LoginInput {
  const result = loginSchema.safeParse(input)

  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Dữ liệu đăng nhập không hợp lệ.', result.error.flatten())
  }

  return result.data
}

export async function login(request: Request, input: LoginInput): Promise<LoginResult> {
  const identifier = input.identifier.includes('@') ? input.identifier.toLowerCase() : input.identifier
  const ipAddress = getRequestIp(request)
  const userAgent = request.get('user-agent') ?? null

  const user = await findUserForLogin(identifier)

  if (!user) {
    await createAuditLog({
      action: AUTH_ACTIONS.LOGIN_FAILED,
      entityType: 'USER',
      entityId: identifier,
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ identifier, reason: 'USER_NOT_FOUND' }),
    })

    throw new AppError(401, 'INVALID_CREDENTIALS', 'Thông tin đăng nhập không chính xác.')
  }

  if (!user.isActive || user.deletedAt) {
    await createAuditLog({
      userId: user.userId,
      action: AUTH_ACTIONS.LOGIN_FAILED,
      entityType: 'USER',
      entityId: user.userId.toString(),
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ identifier, reason: 'ACCOUNT_INACTIVE' }),
    })

    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Tài khoản không thể đăng nhập.')
  }

  if (!user.role.isActive || user.role.deletedAt) {
    throw new AppError(403, 'ROLE_INACTIVE', 'Vai trò hiện tại không hợp lệ để đăng nhập.')
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash)

  if (!isPasswordValid) {
    await createAuditLog({
      userId: user.userId,
      action: AUTH_ACTIONS.LOGIN_FAILED,
      entityType: 'USER',
      entityId: user.userId.toString(),
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ identifier, reason: 'WRONG_PASSWORD' }),
    })

    throw new AppError(401, 'INVALID_CREDENTIALS', 'Thông tin đăng nhập không chính xác.')
  }

  const accessToken = signAccessToken({
    sub: user.userId.toString(),
    role: user.role.roleName,
    username: user.username,
    email: user.email,
  })

  const refreshTokenRaw = generateOpaqueRefreshToken()
  const refreshTokenHash = hashRefreshToken(refreshTokenRaw)
  const refreshDuration = input.rememberMe ? config.refreshTokenRememberMeExpiresIn : config.refreshTokenExpiresIn
  const refreshMaxAge = parseDurationToMs(refreshDuration)
  const refreshExpiresAt = new Date(Date.now() + refreshMaxAge)
  const accessExpiresIn = parseAccessExpiresInSeconds(config.jwtAccessExpiresIn)
  const now = new Date()

  await createRefreshToken({
    id: randomUUID(),
    userId: user.userId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
    ipAddress,
    userAgent,
    createdByIp: ipAddress,
  })

  await updateLastLogin(user.userId, now)

  await createAuditLog({
    userId: user.userId,
    action: AUTH_ACTIONS.LOGIN_SUCCESS,
    entityType: 'USER',
    entityId: user.userId.toString(),
    ipAddress,
    userAgent,
    newValues: JSON.stringify({ identifier, rememberMe: input.rememberMe, role: user.role.roleName }),
  })

  return {
    cookie: {
      name: config.refreshTokenCookieName,
      value: refreshTokenRaw,
      maxAge: refreshMaxAge,
      options: getRefreshCookieBaseOptions(),
    },
    body: {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresIn,
      user: buildAuthUserPayload(user),
    },
  }
}

export async function getMe(userId: bigint): Promise<{ user: AuthUserPayload }> {
  const user = await findUserByIdForMe(userId)

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.')
  }

  if (!user.role.isActive || user.role.deletedAt) {
    throw new AppError(403, 'ROLE_INACTIVE', 'Vai trò hiện tại không hợp lệ.')
  }

  return { user: buildAuthUserPayload(user) }
}

export type RefreshResult = {
  cookie: {
    name: string
    value: string
    maxAge: number
    options: ReturnType<typeof getRefreshCookieBaseOptions>
  }
  body: {
    accessToken: string
    tokenType: 'Bearer'
    expiresIn: number
  }
}

export async function refreshSession(request: Request): Promise<RefreshResult> {
  const rawToken = request.cookies?.[config.refreshTokenCookieName] as string | undefined
  const ipAddress = getRequestIp(request)
  const userAgent = request.get('user-agent') ?? null

  if (!rawToken?.trim()) {
    await createAuditLog({
      action: AUTH_ACTIONS.REFRESH_FAILED,
      entityType: 'REFRESH_TOKEN',
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ reason: 'MISSING_COOKIE' }),
    })
    throw new AppError(401, 'REFRESH_TOKEN_MISSING', 'Không tìm thấy refresh token.')
  }

  const tokenHash = hashRefreshToken(rawToken)
  const record = await findRefreshTokenByTokenHash(tokenHash)

  if (!record) {
    await createAuditLog({
      action: AUTH_ACTIONS.REFRESH_FAILED,
      entityType: 'REFRESH_TOKEN',
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ reason: 'UNKNOWN_TOKEN' }),
    })
    throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'Refresh token không hợp lệ.')
  }

  if (record.revokedAt) {
    await revokeAllActiveRefreshTokensForUser(record.userId, 'REUSE_DETECTED')
    await createAuditLog({
      userId: record.userId,
      action: AUTH_ACTIONS.REFRESH_REUSE_DETECTED,
      entityType: 'REFRESH_TOKEN',
      entityId: record.id,
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ reason: 'REVOKED_TOKEN_REUSE' }),
    })
    throw new AppError(401, 'REFRESH_TOKEN_REUSED', 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
  }

  const now = new Date()

  if (record.expiresAt < now) {
    await revokeRefreshTokenById(record.id, 'EXPIRED')
    await createAuditLog({
      userId: record.userId,
      action: AUTH_ACTIONS.REFRESH_FAILED,
      entityType: 'REFRESH_TOKEN',
      entityId: record.id,
      ipAddress,
      userAgent,
      newValues: JSON.stringify({ reason: 'EXPIRED' }),
    })
    throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token đã hết hạn.')
  }

  const user = record.user

  if (!user.isActive || user.deletedAt) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Tài khoản không thể làm mới phiên.')
  }

  if (!user.role.isActive || user.role.deletedAt) {
    throw new AppError(403, 'ROLE_INACTIVE', 'Vai trò hiện tại không hợp lệ.')
  }

  const newRefreshRaw = generateOpaqueRefreshToken()
  const newRefreshHash = hashRefreshToken(newRefreshRaw)
  const newId = randomUUID()
  const refreshDuration = config.refreshTokenExpiresIn
  const refreshMaxAge = parseDurationToMs(refreshDuration)
  const refreshExpiresAt = new Date(Date.now() + refreshMaxAge)

  await rotateRefreshToken({
    oldTokenId: record.id,
    newTokenId: newId,
    userId: record.userId,
    tokenHash: newRefreshHash,
    expiresAt: refreshExpiresAt,
    ipAddress,
    userAgent,
    createdByIp: ipAddress,
  })

  const accessToken = signAccessToken({
    sub: user.userId.toString(),
    role: user.role.roleName,
    username: user.username,
    email: user.email,
  })

  const accessExpiresIn = parseAccessExpiresInSeconds(config.jwtAccessExpiresIn)

  await createAuditLog({
    userId: user.userId,
    action: AUTH_ACTIONS.REFRESH_SUCCESS,
    entityType: 'REFRESH_TOKEN',
    entityId: newId,
    ipAddress,
    userAgent,
    newValues: JSON.stringify({ rotatedFrom: record.id }),
  })

  return {
    cookie: {
      name: config.refreshTokenCookieName,
      value: newRefreshRaw,
      maxAge: refreshMaxAge,
      options: getRefreshCookieBaseOptions(),
    },
    body: {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresIn,
    },
  }
}

export async function logoutCurrent(request: Request): Promise<void> {
  const rawToken = request.cookies?.[config.refreshTokenCookieName] as string | undefined
  const ipAddress = getRequestIp(request)
  const userAgent = request.get('user-agent') ?? null

  if (rawToken?.trim()) {
    const tokenHash = hashRefreshToken(rawToken)
    const record = await findRefreshTokenByTokenHash(tokenHash)

    if (record && !record.revokedAt && record.expiresAt >= new Date()) {
      await revokeRefreshTokenById(record.id, 'LOGOUT')
      await createAuditLog({
        userId: record.userId,
        action: AUTH_ACTIONS.LOGOUT,
        entityType: 'REFRESH_TOKEN',
        entityId: record.id,
        ipAddress,
        userAgent,
      })
    }
  }
}

export async function logoutAll(userId: bigint, request: Request): Promise<void> {
  const ipAddress = getRequestIp(request)
  const userAgent = request.get('user-agent') ?? null

  await revokeAllActiveRefreshTokensForUser(userId, 'LOGOUT_ALL')

  await createAuditLog({
    userId,
    action: AUTH_ACTIONS.LOGOUT_ALL,
    entityType: 'USER',
    entityId: userId.toString(),
    ipAddress,
    userAgent,
  })
}
