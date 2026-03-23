import { Router } from 'express'
import { academicRouter } from './academic.routes.js'
import { administrativeClassRouter } from './administrative-class.routes.js'
import { authRouter } from './auth.routes.js'
import { courseOfferingRouter } from './course-offering.routes.js'
import { enrollmentRouter } from './enrollment.routes.js'
import { healthRouter } from './health.routes.js'
import { registrationPeriodRouter } from './registration-period.routes.js'
import { subjectRouter } from './subject.routes.js'

export const apiV1Router = Router()

apiV1Router.use(healthRouter)
apiV1Router.use(authRouter)
apiV1Router.use(academicRouter)
apiV1Router.use(subjectRouter)
apiV1Router.use(administrativeClassRouter)
apiV1Router.use(courseOfferingRouter)
apiV1Router.use(enrollmentRouter)
apiV1Router.use(registrationPeriodRouter)
