import { Pool } from 'pg'
import { env } from './env'
import { log } from './logger'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Connection pool optimization
  max: 20, // Maximum number of connections in pool
  min: 2, // Minimum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection cannot be established
  // acquireTimeoutMillis: 60000, // Property doesn't exist in this version
  
  // Reconnection settings
  allowExitOnIdle: false, // Keep process alive even if all connections are idle
})

export async function query(text: string, params?: any[]) {
  const startTime = Date.now()
  
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - startTime
    
    // Log slow queries (> 100ms)
    if (duration > 100) {
      log.dbQuery(text, params, duration)
    }
    
    return result
  } catch (error) {
    log.dbError(text, error as Error, params)
    throw error
  }
}

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as health')
    return result.rows[0]?.health === 1
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Get pool stats
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  }
}

// Transaction helper
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export default pool