import { Pool } from 'pg'

export async function GET() {
  let pool: Pool | null = null
  
  try {
    // Direct hardcoded connection - no env dependencies
    pool = new Pool({
      connectionString: "postgresql://neondb_owner:npg_3nEFWgyPH9wa@ep-dawn-tooth-acu3fhe9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require",
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