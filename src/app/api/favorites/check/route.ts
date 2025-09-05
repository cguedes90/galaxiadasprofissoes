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

/**
 * @swagger
 * /api/favorites/check:
 *   get:
 *     summary: Check if a profession is favorited by the user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profession_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the profession to check
 *     responses:
 *       200:
 *         description: Check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_favorite:
 *                       type: boolean
 *                     favorite_id:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Missing profession_id
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
    const profession_id = parseInt(searchParams.get('profession_id') || '0')

    if (!profession_id) {
      return createResponse({ 
        success: false, 
        message: 'profession_id é obrigatório' 
      }, 400)
    }

    // Check if profession is favorited
    const result = await query(`
      SELECT id FROM user_favorites 
      WHERE user_id = $1 AND profession_id = $2
    `, [authResult.userId, profession_id])

    const is_favorite = result.rows.length > 0
    const favorite_id = is_favorite ? result.rows[0].id : null

    return createResponse({
      success: true,
      data: {
        is_favorite,
        favorite_id
      }
    })

  } catch (error) {
    console.error('Error checking favorite:', error)
    return createResponse({ success: false, message: 'Erro interno do servidor' }, 500)
  }
}