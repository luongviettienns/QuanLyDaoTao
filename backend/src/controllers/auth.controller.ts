import type { Request, Response } from 'express'
import { config } from '../config.js'
import {
  getMe,
  login,
  logoutAll,
  logoutCurrent,
  refreshSession,
  validateLoginInput,
} from '../services/auth.service.js'
import { successResponse } from '../utils/response.js'

function setRefreshCookie(res: Response, name: string, value: string, maxAge: number) {
  res.cookie(name, value, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: config.refreshTokenCookiePath,
    maxAge,
    signed: false,
  })
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(config.refreshTokenCookieName, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: config.refreshTokenCookiePath,
  })
}

export async function loginController(req: Request, res: Response) {
  const input = validateLoginInput(req.body)
  const result = await login(req, input)

  setRefreshCookie(res, result.cookie.name, result.cookie.value, result.cookie.maxAge)

  res.status(200).json(successResponse('Đăng nhập thành công.', result.body))
}

export async function meController(req: Request, res: Response) {
  const userId = req.auth!.userId
  const { user } = await getMe(userId)

  res.status(200).json(successResponse('OK', { user }))
}

export async function refreshController(req: Request, res: Response) {
  const result = await refreshSession(req)

  setRefreshCookie(res, result.cookie.name, result.cookie.value, result.cookie.maxAge)

  res.status(200).json(successResponse('Làm mới phiên thành công.', result.body))
}

export async function logoutController(req: Request, res: Response) {
  await logoutCurrent(req)
  clearRefreshCookie(res)

  res.status(200).json(successResponse('Đăng xuất thành công.', { ok: true }))
}

export async function logoutAllController(req: Request, res: Response) {
  await logoutAll(req.auth!.userId, req)
  clearRefreshCookie(res)

  res.status(200).json(successResponse('Đã đăng xuất tất cả thiết bị.', { ok: true }))
}
