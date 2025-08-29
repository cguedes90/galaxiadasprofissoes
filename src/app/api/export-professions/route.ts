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

    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        area,
        required_education,
        salary_min,
        salary_max,
        formation_time,
        main_activities,
        certifications,
        related_professions,
        icon_color,
        x_position,
        y_position,
        created_at,
        updated_at
      FROM professions 
      ORDER BY id ASC
    `)
    
    console.log(`✅ Exported ${result.rows.length} complete professions`)

    return Response.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `All ${result.rows.length} professions exported with complete data`
    })

  } catch (error) {
    console.error('❌ Export error:', error)
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