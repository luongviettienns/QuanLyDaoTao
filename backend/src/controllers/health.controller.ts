import type { Request, Response } from 'express'
import { getHealthStatus } from '../services/health.service.js'

export async function getHealthController(_req: Request, res: Response) {
  const result = await getHealthStatus()

  res.status(result.httpStatus).json(result.body)
}
