import { Pool } from 'pg'
import { env } from './env'
import { log } from './logger'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  const startTime = Date.now()
  
  try {
    const result = await client.query(text, params)
    const duration = Date.now() - startTime
    
    log.dbQuery(text, params, duration)
    return result
  } catch (error) {
    log.dbError(text, error as Error, params)
    throw error
  } finally {
    client.release()
  }
}

export default pool