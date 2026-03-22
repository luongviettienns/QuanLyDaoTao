import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { healthRouter } from './health.routes.js'

export const apiV1Router = Router()

apiV1Router.use(healthRouter)
apiV1Router.use(authRouter)
