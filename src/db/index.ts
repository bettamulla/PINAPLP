import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let dbClient: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!dbClient) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    dbClient = postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
    db = drizzle(dbClient, { schema })
  }
  return db
}

export { schema }
export type DB = ReturnType<typeof getDb>