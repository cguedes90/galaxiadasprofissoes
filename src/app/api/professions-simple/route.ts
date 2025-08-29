import { Pool } from 'pg'

export async function GET() {
  let pool: Pool | null = null
  
  try {
    // Use environment variable (security compliant)
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      ssl: { rejectUnauthorized: false }
    })

    const result = await pool.query('SELECT * FROM professions ORDER BY created_at DESC')
    
    console.log(`✅ Simple API: Found ${result.rows.length} professions`)

    return Response.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error('❌ Simple API error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })

  } finally {
    if (pool) {
      await pool.end()
    }
  }
}