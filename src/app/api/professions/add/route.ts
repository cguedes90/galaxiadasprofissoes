import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface NewProfession {
  name: string
  description: string
  area: string
  required_education: string
  salary_min: number
  salary_max: number
  formation_time: string
  main_activities: string[]
  certifications: string[]
  related_professions: string[]
  icon_color?: string
}

export async function POST(request: Request) {
  try {
    const professionData: NewProfession = await request.json()
    
    // Validações básicas
    if (!professionData.name || !professionData.description || !professionData.area) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, description, area' },
        { status: 400 }
      )
    }

    // Verificar se a profissão já existe
    const existingProfession = await query(
      'SELECT id FROM professions WHERE name = $1',
      [professionData.name]
    )

    if (existingProfession.rows.length > 0) {
      return NextResponse.json(
        { error: 'Profissão já existe na galáxia' },
        { status: 409 }
      )
    }

    // Gerar posição aleatória para a nova profissão
    const x_position = Math.random() * 600 - 300 // -300 a 300
    const y_position = Math.random() * 600 - 300 // -300 a 300

    // Gerar cor aleatória se não fornecida
    const icon_color = professionData.icon_color || generateRandomColor()

    // Inserir nova profissão
    const result = await query(`
      INSERT INTO professions (
        name, description, area, required_education, 
        salary_min, salary_max, formation_time, 
        main_activities, certifications, related_professions,
        icon_color, x_position, y_position,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      professionData.name,
      professionData.description,
      professionData.area,
      professionData.required_education,
      professionData.salary_min || 2000,
      professionData.salary_max || 10000,
      professionData.formation_time || '4 anos',
      professionData.main_activities || [],
      professionData.certifications || [],
      professionData.related_professions || [],
      icon_color,
      x_position,
      y_position
    ])

    const newProfession = result.rows[0]

    return NextResponse.json({
      success: true,
      message: `Profissão "${professionData.name}" adicionada à galáxia com sucesso!`,
      profession: newProfession,
      totalProfessions: await getTotalProfessions()
    })

  } catch (error) {
    console.error('Erro ao adicionar profissão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#686DE0', '#4834D4', '#00D4AA', '#26DE81', '#FD79A8',
    '#FDCB6E', '#6C5CE7', '#A29BFE', '#E17055', '#00B894'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

async function getTotalProfessions(): Promise<number> {
  try {
    const result = await query('SELECT COUNT(*) as total FROM professions')
    return parseInt(result.rows[0].total)
  } catch (error) {
    return 0
  }
}