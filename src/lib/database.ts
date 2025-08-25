import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_3nEFWgyPH9wa@ep-dawn-tooth-acu3fhe9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export default pool