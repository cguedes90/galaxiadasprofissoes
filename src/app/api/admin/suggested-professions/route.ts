import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
import { ApiResponseHandler as ApiResponse } from '@/lib/api-response'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key-change-in-production'

// Middleware para verificar autenticação admin
function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'super_admin') {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

// GET - Listar profissões sugeridas
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const adminAuth = verifyAdminAuth(request)
    if (!adminAuth) {
      return ApiResponse.unauthorized('Acesso negado - apenas admins')
    }
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, approved, rejected
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    console.log('GET /api/admin/suggested-professions', { status, page, limit })

    // Construir query com filtros
    let sql = 'SELECT * FROM suggested_professions'
    const params: any[] = []

    if (status) {
      sql += ' WHERE status = $1'
      params.push(status)
    }

    sql += ' ORDER BY created_at DESC'

    // Contar total
    let countSql = 'SELECT COUNT(*) FROM suggested_professions'
    if (status) {
      countSql += ' WHERE status = $1'
    }
    
    const countResult = await query(countSql, status ? [status] : [])
    const total = parseInt(countResult.rows[0].count)

    // Aplicar paginação
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)
    
    console.log('Suggested professions fetched', { 
      total, 
      returned: result.rows.length,
      page,
      limit,
      status
    })

    // Calcular estatísticas
    const statsQuery = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM suggested_professions 
      GROUP BY status
    `)
    
    const stats = statsQuery.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count)
      return acc
    }, {} as { [key: string]: number })

    return ApiResponse.success(result.rows, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      },
      filters: { status },
      stats,
      cached: false
    })
  } catch (error) {
    console.error('Database error in GET /api/admin/suggested-professions', error)
    return ApiResponse.databaseError('Falha ao buscar profissões sugeridas')
  }
}

// PUT - Aprovar ou rejeitar profissão sugerida
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const adminAuth = verifyAdminAuth(request)
    if (!adminAuth) {
      return ApiResponse.unauthorized('Acesso negado - apenas admins')
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { action } = await request.json()

    if (!id || !action) {
      return ApiResponse.validationError('ID e ação são obrigatórios')
    }

    if (!['approve', 'reject'].includes(action)) {
      return ApiResponse.validationError('Ação deve ser "approve" ou "reject"')
    }

    console.log(`${action.toUpperCase()} suggested profession ${id}`)

    if (action === 'approve') {
      // Buscar a profissão sugerida
      const suggestedResult = await query(
        'SELECT * FROM suggested_professions WHERE id = $1',
        [id]
      )

      if (suggestedResult.rows.length === 0) {
        return ApiResponse.notFound('Profissão sugerida não encontrada')
      }

      const suggested = suggestedResult.rows[0]

      // Inserir na tabela principal de profissões
      await query(`
        INSERT INTO professions 
        (name, description, area, required_education, salary_min, salary_max, 
         formation_time, main_activities, certifications, related_professions, 
         icon_color, x_position, y_position) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        suggested.name,
        suggested.description,
        suggested.area,
        suggested.required_education,
        suggested.salary_min,
        suggested.salary_max,
        suggested.formation_time,
        suggested.main_activities,
        suggested.certifications,
        suggested.related_professions,
        suggested.icon_color,
        suggested.x_position,
        suggested.y_position
      ])

      // Atualizar status para aprovado
      await query(
        'UPDATE suggested_professions SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['approved', id]
      )

      console.log('✅ Profissão aprovada e adicionada à galáxia:', suggested.name)

      return ApiResponse.success(null, {
        message: 'Profissão aprovada e adicionada à galáxia com sucesso!'
      })
    } else {
      // Rejeitar
      await query(
        'UPDATE suggested_professions SET status = $1 WHERE id = $2',
        ['rejected', id]
      )

      console.log('❌ Profissão rejeitada:', id)

      return ApiResponse.success(null, {
        message: 'Profissão rejeitada'
      })
    }

  } catch (error: any) {
    console.error('Error in PUT /api/admin/suggested-professions', error)
    
    if (error.code === '23505') { // Unique violation
      return ApiResponse.conflict('Uma profissão com este nome já existe')
    }
    
    return ApiResponse.internalError('Falha ao processar ação')
  }
}

// PATCH - Editar profissão sugerida
export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticação
    const adminAuth = verifyAdminAuth(request)
    if (!adminAuth) {
      return ApiResponse.unauthorized('Acesso negado - apenas admins')
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { action, data } = await request.json()

    if (!id) {
      return ApiResponse.validationError('ID é obrigatório')
    }

    if (action === 'edit' && data) {
      // Validar dados básicos
      if (!data.name || !data.description) {
        return ApiResponse.validationError('Nome e descrição são obrigatórios')
      }

      // Atualizar na tabela suggested_professions
      await query(`
        UPDATE suggested_professions 
        SET name = $1, description = $2, area = $3, required_education = $4, 
            salary_min = $5, salary_max = $6, formation_time = $7
        WHERE id = $8
      `, [
        data.name,
        data.description,
        data.area || '',
        data.required_education || '',
        data.salary_min || 0,
        data.salary_max || 0,
        data.formation_time || '4 anos',
        id
      ])

      console.log('✅ Profissão editada pelo admin:', data.name)

      return ApiResponse.success(null, {
        message: 'Profissão editada com sucesso!'
      })
    }

    return ApiResponse.validationError('Ação inválida')

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/suggested-professions', error)
    return ApiResponse.internalError('Falha ao editar profissão')
  }
}