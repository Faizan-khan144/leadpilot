import { app } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { seedDemoData } from './seed.js'

let server

const start = async () => {
  try {
    await connectDatabase()
    if (env.seedDemo) {
      const result = await seedDemoData()
      if (result.seeded) {
        console.log(`[seed] Demo workspace ready. Sign in as ${result.ownerEmail}.`)
      }
    }
    server = app.listen(env.port, () => {
      console.log(`[api] LeadPilot API listening on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('[api] Failed to start:', error.message)
    process.exit(1)
  }
}

const shutdown = async (signal) => {
  console.log(`[api] ${signal} received, shutting down.`)
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  await disconnectDatabase()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('unhandledRejection', (error) => {
  console.error('[api] Unhandled rejection:', error)
})

start()
