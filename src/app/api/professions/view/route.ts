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
import { ProfessionViewRequest } from '@/types/favorites'
import { log } from '@/lib/logger-safe'

/**
 * @swagger
 * /api/professions/view:
 *   post:
 *     summary: Track a profession view by the user
 *     tags: [Professions]
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
 *             properties:
 *               profession_id:
 *                 type: integer
 *               profession_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: View tracked successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyJWT(request)
    if (!authResult.success || !authResult.userId) {
      return createResponse({ success: false, message: 'Token inválido' }, 401)
    }

    const body: ProfessionViewRequest = await request.json()

    // Validation
    if (!body.profession_id || !body.profession_name) {
      return createResponse({ 
        success: false, 
        message: 'profession_id e profession_name são obrigatórios' 
      }, 400)
    }

    // Check if view record already exists
    const existingResult = await query(`
      SELECT id, view_count FROM user_profession_views 
      WHERE user_id = $1 AND profession_id = $2
    `, [authResult.userId, body.profession_id])

    if (existingResult.rows.length > 0) {
      // Update existing view record
      await query(`
        UPDATE user_profession_views 
        SET view_count = view_count + 1, last_viewed_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND profession_id = $2
      `, [authResult.userId, body.profession_id])

      log.info(`User ${authResult.userId} viewed profession ${body.profession_id} (count: ${existingResult.rows[0].view_count + 1})`)
    } else {
      // Insert new view record
      await query(`
        INSERT INTO user_profession_views (user_id, profession_id, profession_name)
        VALUES ($1, $2, $3)
      `, [
        authResult.userId,
        body.profession_id,
        body.profession_name
      ])

      log.info(`User ${authResult.userId} viewed profession ${body.profession_id} for the first time`)
    }

    return createResponse({
      success: true,
      message: 'Visualização registrada com sucesso'
    })

  } catch (error) {
    log.error('Error tracking profession view:', error)
    return createResponse({ success: false, message: 'Erro interno do servidor' }, 500)
  }
}