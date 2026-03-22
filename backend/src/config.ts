import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'CORS_ORIGIN',
] as const

const cookieSecure = process.env.COOKIE_SECURE?.trim() === 'true'
const cookieSameSite = (process.env.COOKIE_SAME_SITE?.trim() || 'lax') as 'lax' | 'strict' | 'none'
const refreshTokenRememberMeExpiresIn = process.env.REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN?.trim() || '30d'
const refreshTokenCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME?.trim() || 'refreshToken'
const refreshTokenCookiePath = process.env.REFRESH_TOKEN_COOKIE_PATH?.trim() || '/api/v1/auth'

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]?.trim()) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: Number(process.env.PORT?.trim() || '4000'),
  databaseUrl: process.env.DATABASE_URL!.trim(),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!.trim(),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN!.trim(),
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN!.trim(),
  refreshTokenRememberMeExpiresIn,
  refreshTokenCookieName,
  refreshTokenCookiePath,
  cookieSecure,
  cookieSameSite,
  cookieSecret: process.env.COOKIE_SECRET?.trim() || null,
  corsOrigin: process.env.CORS_ORIGIN!.trim(),
} as const
