import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1 AS ok`
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
