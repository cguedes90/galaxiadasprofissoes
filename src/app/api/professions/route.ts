import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import { generalApiRateLimit } from '@/lib/rate-limiter'

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const area = searchParams.get('area')

    let sql = 'SELECT * FROM professions'
    const params: any[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push('name ILIKE $' + (params.length + 1))
      params.push(`%${search}%`)
    }

    if (area) {
      conditions.push('area = $' + (params.length + 1))
      params.push(area)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY name'

    const result = await query(sql, params)
    return ApiResponse.success(result.rows, {
      total: result.rows.length,
      filters: { search, area }
    })
  } catch (error) {
    console.error('Database error:', error)
    return ApiResponse.databaseError('Falha ao buscar profissões')
  }
}

async function handlePOST(request: NextRequest) {
  try {
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

    return ApiResponse.success(result.rows[0])
  } catch (error: any) {
    console.error('Database error:', error)
    if (error.code === '23505') { // Unique violation
      return ApiResponse.conflict('Uma profissão com este nome já existe')
    }
    return ApiResponse.databaseError('Falha ao criar profissão')
  }
}

export const GET = generalApiRateLimit(handleGET)
export const POST = generalApiRateLimit(handlePOST)