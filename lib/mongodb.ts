import mongoose, { ConnectOptions } from 'mongoose'

/**
 * Shape of the cached Mongoose connection + promise that we store on the
 * global object so the Next.js hot reload cycle reuses a single connection.
 */
interface MongoCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Augment the Node.js global type so TypeScript knows about our cache slot.
declare global {
  var __mongoCache: MongoCache | undefined
}

const cached: MongoCache =
  globalThis.__mongoCache ??
  (globalThis.__mongoCache = { conn: null, promise: null })

/**
 * Establishes (or retrieves) a singleton MongoDB connection using Mongoose.
 * Ensures local development hot reloads do not spawn multiple sockets.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const { MONGODB_URI, MONGODB_DB } = process.env

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment variables.')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const options: ConnectOptions = MONGODB_DB ? { dbName: MONGODB_DB } : {}

    // Store the in-flight connection attempt so concurrent calls await the same promise.
    cached.promise = mongoose.connect(MONGODB_URI, options)
  }

  cached.conn = await cached.promise
  return cached.conn
}

/**
 * Optional helper to gracefully close the connection (useful for tests or scripts).
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!cached.conn) {
    return
  }

  await mongoose.disconnect()
  cached.conn = null
  cached.promise = null
}
