import { NextRequest } from 'next/server'
import { query } from '@/lib/database'
// Simple auth verification for now
async function verifyJWT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  return { success: !!token, userId: token ? 'user-123' : null }
}

// Simple response helper
function createResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
import { FavoriteRequest, UserFavorite } from '@/types/favorites'
import { log } from '@/lib/logger-safe'

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user's favorite professions
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of favorites to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of favorites to skip
 *     responses:
 *       200:
 *         description: List of user's favorite professions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserFavorite'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.userId) {
      return createResponse({ success: false, message: 'Token inválido' }, 401)
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // Get user's favorites
    const result = await query(`
      SELECT 
        id,
        user_id,
        profession_id,
        profession_name,
        profession_area,
        notes,
        created_at
      FROM user_favorites 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [authResult.userId, limit, offset])

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM user_favorites 
      WHERE user_id = $1
    `, [authResult.userId])

    const favorites: UserFavorite[] = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      profession_id: row.profession_id,
      profession_name: row.profession_name,
      profession_area: row.profession_area,
      notes: row.notes,
      created_at: row.created_at
    }))

    log.info(`User ${authResult.userId} retrieved ${favorites.length} favorites`)

    return createResponse({
      success: true,
      data: favorites,
      count: parseInt(countResult.rows[0]?.total || '0')
    })

  } catch (error) {
    log.error('Error fetching favorites:', error)
    return createResponse({ success: false, message: 'Erro interno do servidor' }, 500)
  }
}

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add a profession to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profession_id
 *               - profession_name
 *               - profession_area
 *             properties:
 *               profession_id:
 *                 type: integer
 *               profession_name:
 *                 type: string
 *               profession_area:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profession added to favorites
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Profession already in favorites
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.userId) {
      return createResponse({ success: false, message: 'Token inválido' }, 401)
    }

    const body: FavoriteRequest = await request.json()

    // Validation
    if (!body.profession_id || !body.profession_name || !body.profession_area) {
      return createResponse({ 
        success: false, 
        message: 'profession_id, profession_name e profession_area são obrigatórios' 
      }, 400)
    }

    // Check if already favorited
    const existingResult = await query(`
      SELECT id FROM user_favorites 
      WHERE user_id = $1 AND profession_id = $2
    `, [authResult.userId, body.profession_id])

    if (existingResult.rows.length > 0) {
      return createResponse({ 
        success: false, 
        message: 'Profissão já está nos favoritos' 
      }, 409)
    }

    // Insert favorite
    const result = await query(`
      INSERT INTO user_favorites (user_id, profession_id, profession_name, profession_area, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, profession_id, profession_name, profession_area, notes, created_at
    `, [
      authResult.userId,
      body.profession_id,
      body.profession_name,
      body.profession_area,
      body.notes || null
    ])

    const favorite: UserFavorite = {
      id: result.rows[0].id,
      user_id: result.rows[0].user_id,
      profession_id: result.rows[0].profession_id,
      profession_name: result.rows[0].profession_name,
      profession_area: result.rows[0].profession_area,
      notes: result.rows[0].notes,
      created_at: result.rows[0].created_at
    }

    log.info(`User ${authResult.userId} added profession ${body.profession_id} to favorites`)

    return createResponse({
      success: true,
      data: favorite,
      message: 'Profissão adicionada aos favoritos com sucesso'
    }, 201)

  } catch (error) {
    log.error('Error adding favorite:', error)
    return createResponse({ success: false, message: 'Erro interno do servidor' }, 500)
  }
}

/**
 * @swagger
 * /api/favorites:
 *   delete:
 *     summary: Remove a profession from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profession_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the profession to remove from favorites
 *     responses:
 *       200:
 *         description: Profession removed from favorites
 *       400:
 *         description: Missing profession_id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.userId) {
      return createResponse({ success: false, message: 'Token inválido' }, 401)
    }

    const { searchParams } = new URL(request.url)
    const profession_id = parseInt(searchParams.get('profession_id') || '0')

    if (!profession_id) {
      return createResponse({ 
        success: false, 
        message: 'profession_id é obrigatório' 
      }, 400)
    }

    // Delete favorite
    const result = await query(`
      DELETE FROM user_favorites 
      WHERE user_id = $1 AND profession_id = $2
      RETURNING id
    `, [authResult.userId, profession_id])

    if (result.rows.length === 0) {
      return createResponse({ 
        success: false, 
        message: 'Favorito não encontrado' 
      }, 404)
    }

    log.info(`User ${authResult.userId} removed profession ${profession_id} from favorites`)

    return createResponse({
      success: true,
      message: 'Profissão removida dos favoritos com sucesso'
    })

  } catch (error) {
    log.error('Error removing favorite:', error)
    return createResponse({ success: false, message: 'Erro interno do servidor' }, 500)
  }
}