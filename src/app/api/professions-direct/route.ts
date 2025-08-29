import { NextRequest } from 'next/server'
import { Pool } from 'pg'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'

// Temporary direct connection to bypass env variable issues
const NEON_CONNECTION = "postgresql://neondb_owner:npg_3nEFWgyPH9wa@ep-dawn-tooth-acu3fhe9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

export async function GET(request: NextRequest) {
  let pool: Pool | null = null
  
  try {
    console.log('🚀 Direct professions API with hardcoded connection')
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const area = searchParams.get('area')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    // Create pool with hardcoded connection
    pool = new Pool({
      connectionString: NEON_CONNECTION,
      max: 5,
      min: 0,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      ssl: {
        rejectUnauthorized: false
      }
    })

    // Build query
    let sql = 'SELECT * FROM professions'
    const params: any[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push('(name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ' OR area ILIKE $' + (params.length + 1) + ')')
      params.push(`%${search}%`)
    }

    if (area) {
      conditions.push('area = $' + (params.length + 1))
      params.push(area)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY created_at DESC'

    // Get total count for pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)')
    const countResult = await pool.query(countSql, params)
    const total = parseInt(countResult.rows[0].count)

    // Apply pagination to main query
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(sql, params)
    
    console.log('✅ Direct query successful', { 
      total, 
      returned: result.rows.length,
      page,
      limit
    })

    return ApiResponse.success(result.rows, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      },
      filters: { search, area },
      cached: false,
      direct_connection: true
    })

  } catch (error) {
    console.error('❌ Direct professions query failed:', error)
    return ApiResponse.databaseError(
      'Falha ao buscar profissões diretamente: ' + (error instanceof Error ? error.message : String(error))
    )

  } finally {
    if (pool) {
      await pool.end()
    }
  }
}