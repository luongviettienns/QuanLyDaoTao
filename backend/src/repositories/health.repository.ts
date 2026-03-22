import { prisma } from '../database.js'

export async function checkHealthDatabaseStatus() {
  await prisma.$queryRaw`SELECT 1 AS ok`

  return 'up' as const
}
