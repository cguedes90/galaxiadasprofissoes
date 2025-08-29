import { Pool } from 'pg'
import { env } from './env'
import { log } from './logger-safe' // Safe logger for all environments

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Simplified connection settings for Neon compatibility
  max: 10, // Reduce max connections for Neon
  min: 0, // Allow zero idle connections
  idleTimeoutMillis: 10000, // Shorter idle timeout
  connectionTimeoutMillis: 10000, // Longer connection timeout for Neon
  
  // SSL settings for Neon
  ssl: {
    rejectUnauthorized: false
  },
  
  // Reconnection settings
  allowExitOnIdle: false,
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