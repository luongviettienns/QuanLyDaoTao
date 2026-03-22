import { config } from '../config.js'
import { checkHealthDatabaseStatus } from '../repositories/health.repository.js'

export async function getHealthStatus() {
  try {
    const database = await checkHealthDatabaseStatus()

    return {
      httpStatus: 200,
      body: {
        status: 'ok',
        service: 'backend',
        environment: config.nodeEnv,
        database,
        timestamp: new Date().toISOString(),
      },
    }
  } catch {
    return {
      httpStatus: 503,
      body: {
        status: 'degraded',
        service: 'backend',
        environment: config.nodeEnv,
        database: 'down',
        timestamp: new Date().toISOString(),
      },
    }
  }
}
