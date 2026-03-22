import type { Prisma } from '@prisma/client'
import { prisma } from '../database.js'

type FindUserForLoginResult = Prisma.UserGetPayload<{
  include: {
    role: true
    studentProfile: true
    lecturerProfile: true
  }
}>

export async function findUserForLogin(identifier: string): Promise<FindUserForLoginResult | null> {
  return prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ username: identifier }, { email: identifier }],
    },
    include: {
      role: true,
      studentProfile: true,
      lecturerProfile: true,
    },
  })
}

export async function createRefreshToken(params: {
  id: string
  userId: bigint
  tokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdByIp: string | null
}) {
  return prisma.refreshToken.create({
    data: {
      id: params.id,
      userId: params.userId,
      tokenHash: params.tokenHash,
      expiresAt: params.expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdByIp: params.createdByIp,
    },
  })
}

export async function updateLastLogin(userId: bigint, lastLoginAt: Date) {
  return prisma.user.update({
    where: { userId },
    data: { lastLoginAt },
  })
}

export async function createAuditLog(params: {
  userId?: bigint | null
  action: string
  entityType?: string | null
  entityId?: string | null
  oldValues?: string | null
  newValues?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  })
}

type UserForMeResult = Prisma.UserGetPayload<{
  include: {
    role: true
    studentProfile: true
    lecturerProfile: true
  }
}>

export async function findUserByIdForMe(userId: bigint): Promise<UserForMeResult | null> {
  return prisma.user.findFirst({
    where: {
      userId,
      deletedAt: null,
      isActive: true,
    },
    include: {
      role: true,
      studentProfile: true,
      lecturerProfile: true,
    },
  })
}

export async function findRefreshTokenByTokenHash(tokenHash: string) {
  return prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: { include: { role: true } } },
  })
}

export async function rotateRefreshToken(params: {
  oldTokenId: string
  newTokenId: string
  userId: bigint
  tokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdByIp: string | null
}) {
  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.create({
      data: {
        id: params.newTokenId,
        userId: params.userId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        createdByIp: params.createdByIp,
      },
    })

    return tx.refreshToken.update({
      where: { id: params.oldTokenId },
      data: {
        revokedAt: new Date(),
        revokedReason: 'ROTATED',
        replacedByTokenId: params.newTokenId,
      },
    })
  })
}

export async function revokeRefreshTokenById(tokenId: string, reason: string) {
  return prisma.refreshToken.updateMany({
    where: { id: tokenId, revokedAt: null },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  })
}

export async function revokeAllActiveRefreshTokensForUser(userId: bigint, reason: string) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  })
}
