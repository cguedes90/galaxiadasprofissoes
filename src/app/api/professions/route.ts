import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: Request) {
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
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Falha ao buscar profissões' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const result = await query(
      `INSERT INTO professions 
       (name, description, area, required_education, salary_min, salary_max, 
        formation_time, main_activities, certifications, related_professions, 
        icon_color, x_position, y_position) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        name, description, area, required_education, salary_min, salary_max,
        formation_time, main_activities, certifications, related_professions,
        icon_color, x_position, y_position
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Falha ao criar profissão' }, { status: 500 })
  }
}