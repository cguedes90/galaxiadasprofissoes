import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
// import { generalApiRateLimit } from '@/lib/rate-limiter' // Disabled to avoid Redis dependency
// import { getCachedProfessions, getCachedSearchResults, invalidateProfessionCache, invalidateSearchCache } from '@/lib/cache-strategy' // Disabled to avoid Redis dependency
// import { log } from '@/lib/logger' // Disabled to avoid any Redis dependency

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const area = searchParams.get('area')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    console.log('GET /api/professions', { search, area, page, limit })

    // Direct database query - no cache, no Redis dependencies

    // Fallback to database with filters and pagination
    let sql = 'SELECT * FROM professions'
    const params: any[] = []
    const conditions: string[] = []

    if (area) {
      conditions.push('area = $' + (params.length + 1))
      params.push(area)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY created_at DESC'

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) FROM professions'
    const countParams: any[] = []
    
    if (area) {
      countSql += ' WHERE area = $1'
      countParams.push(area)
    }
    
    const countResult = await query(countSql, countParams)
    const total = parseInt(countResult.rows[0].count)

    // Apply pagination to main query
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)
    
    console.log('Professions fetched from database', { 
      total, 
      returned: result.rows.length,
      page,
      limit,
      filters: { area }
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
      filters: { area },
      cached: false
    })
  } catch (error) {
    console.error('Database error in GET /api/professions', error)
    return ApiResponse.databaseError('Falha ao buscar profissões')
  }
}

async function handlePOST(request: NextRequest) {
  try {
    console.log('POST /api/professions')
    
    const body = await request.json()
    const {
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
      y_position
    } = body

    // Validation
    if (!name || !description || !area) {
      return ApiResponse.validationError(
        'Nome, descrição e área são obrigatórios',
        { missing_fields: { name: !name, description: !description, area: !area } }
      )
    }

    const result = await query(
      `INSERT INTO professions 
       (name, description, area, required_education, salary_min, salary_max, 
        formation_time, main_activities, certifications, related_professions, 
        icon_color, x_position, y_position) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        name, description, area, required_education, salary_min || 0, salary_max || 0,
        formation_time || '4 anos', main_activities || [], certifications || [], related_professions || [],
        icon_color || '#ffffff', x_position || 0, y_position || 0
      ]
    )

    const newProfession = result.rows[0]
    
    // Cache invalidation disabled to avoid Redis dependency
    // await invalidateProfessionCache() 
    // await invalidateSearchCache()

    console.log('New profession created', { 
      professionId: newProfession.id,
      name: newProfession.name,
      area: newProfession.area
    })

    return ApiResponse.success(newProfession, {
      message: 'Profissão criada com sucesso'
    })
  } catch (error: any) {
    console.error('Database error in POST /api/professions', error)
    
    if (error.code === '23505') { // Unique violation
      return ApiResponse.conflict('Uma profissão com este nome já existe')
    }
    return ApiResponse.databaseError('Falha ao criar profissão')
  }
}

export const GET = handleGET // Removed rate limiting to avoid Redis dependency
export const POST = handlePOST // Removed rate limiting to avoid Redis dependency