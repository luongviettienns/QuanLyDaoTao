import type { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import './types/express-augment.js'
import { config } from './config.js'
import { apiV1Router } from './routes/index.js'
import { AppError } from './utils/app-error.js'
import { errorResponse } from './utils/response.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true)
          return
        }

        if (config.corsOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`CORS blocked for origin: ${origin}`))
      },
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser(config.cookieSecret ?? undefined))

  app.use('/api/v1', apiV1Router)

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details))
      return
    }

    console.error('Unhandled error', error)
    res.status(500).json(errorResponse('Đã xảy ra lỗi nội bộ.', 'INTERNAL_SERVER_ERROR'))
  })

  return app
}
