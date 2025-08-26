import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { withAuth } from '@/lib/auth'

async function handleGET(request: NextRequest, user: any) {
  try {
    // Only authenticated users can access admin endpoints
    const result = await query('SELECT * FROM professions ORDER BY name')
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar profissões' }, 
      { status: 500 }
    )
  }
}

async function handlePOST(request: NextRequest, user: any) {
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

    // Validate required fields
    if (!name || !description || !area) {
      return NextResponse.json(
        { error: 'Nome, descrição e área são obrigatórios' },
        { status: 400 }
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

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Falha ao criar profissão' }, 
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGET)
export const POST = withAuth(handlePOST)