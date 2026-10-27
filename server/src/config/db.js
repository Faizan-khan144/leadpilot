import mongoose from 'mongoose'
import { env } from './env.js'

let memoryServer = null

export const connectDatabase = async (uri = env.mongoUri) => {
  let connectionUri = uri

  if (env.useMemoryDb && env.nodeEnv !== 'production') {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'leadpilot' },
    })
    connectionUri = memoryServer.getUri('leadpilot')
    console.log('[db] Using an in-memory MongoDB instance for local development.')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(connectionUri)
  return mongoose.connection
}

export const disconnectDatabase = async () => {
  await mongoose.disconnect()
  if (memoryServer) {
    await memoryServer.stop()
    memoryServer = null
  }
}
