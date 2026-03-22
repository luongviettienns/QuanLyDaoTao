import { createServer } from 'node:http'
import { createApp } from './app.js'
import { config } from './config.js'
import { checkDatabaseConnection, disconnectDatabase } from './database.js'

async function startServer() {
  await checkDatabaseConnection()

  const app = createApp()
  const server = createServer(app)

  server.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`)
  })

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startServer().catch(async (error) => {
  console.error('Failed to start backend server', error)
  await disconnectDatabase()
  process.exit(1)
})
