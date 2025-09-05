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
import { RecommendationEngine } from '@/lib/recommendation-engine'
import { RecommendationFilters } from '@/types/recommendations'
import { log } from '@/lib/logger-safe'
import { fallbackProfessions } from '@/data/fallback-professions'

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get personalized profession recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Maximum number of recommendations
 *       - in: query
 *         name: salary_min
 *         schema:
 *           type: integer
 *         description: Minimum salary filter
 *       - in: query
 *         name: salary_max
 *         schema:
 *           type: integer
 *         description: Maximum salary filter
 *       - in: query
 *         name: max_education_time
 *         schema:
 *           type: integer
 *         description: Maximum education time in years
 *       - in: query
 *         name: include_areas
 *         schema:
 *           type: string
 *         description: Comma-separated list of areas to include
 *       - in: query
 *         name: exclude_areas
 *         schema:
 *           type: string
 *         description: Comma-separated list of areas to exclude
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RecommendationsResult'
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication (optional for recommendations)
    const authResult = await verifyJWT(request)
    const isAuthenticated = authResult.success && authResult.userId

    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const filters: RecommendationFilters = {
      limit: Math.min(parseInt(searchParams.get('limit') || '12'), 20),
      salaryMin: searchParams.get('salary_min') ? parseInt(searchParams.get('salary_min')!) : undefined,
      salaryMax: searchParams.get('salary_max') ? parseInt(searchParams.get('salary_max')!) : undefined,
      maxEducationTime: searchParams.get('max_education_time') ? parseInt(searchParams.get('max_education_time')!) : undefined,
      includeAreas: searchParams.get('include_areas')?.split(',').filter(Boolean),
      excludeAreas: searchParams.get('exclude_areas')?.split(',').filter(Boolean),
      onlyTrending: searchParams.get('only_trending') === 'true'
    }

    // Get professions from database or fallback
    let professions
    try {
      const professionsResult = await query('SELECT * FROM professions ORDER BY created_at DESC')
      professions = professionsResult.rows
      
      if (professions.length === 0) {
        throw new Error('No professions in database')
      }
    } catch (error) {
      log.warn('Using fallback professions for recommendations:', error)
      professions = fallbackProfessions
    }

    // Build recommendation context
    let context: any = {
      userId: isAuthenticated ? authResult.userId : undefined
    }

    if (isAuthenticated) {
      // Get user's favorites
      try {
        const favoritesResult = await query(`
          SELECT profession_id, profession_name, profession_area, created_at
          FROM user_favorites 
          WHERE user_id = $1 
          ORDER BY created_at DESC
          LIMIT 10
        `, [authResult.userId])
        
        context.favorites = favoritesResult.rows
      } catch (error) {
        log.warn('Could not fetch user favorites:', error)
        context.favorites = []
      }

      // Get user's viewed professions
      try {
        const viewsResult = await query(`
          SELECT profession_name
          FROM user_profession_views 
          WHERE user_id = $1 
          ORDER BY last_viewed_at DESC
          LIMIT 20
        `, [authResult.userId])
        
        context.viewedProfessions = viewsResult.rows.map((row: any) => row.profession_name)
        
        // Extract explored areas
        const areasResult = await query(`
          SELECT DISTINCT uf.profession_area as area
          FROM user_favorites uf
          WHERE uf.user_id = $1
          UNION
          SELECT DISTINCT profession_area as area 
          FROM user_profession_views upv
          WHERE upv.user_id = $1
        `, [authResult.userId])
        
        context.areasExplored = areasResult.rows.map((row: any) => row.area)
      } catch (error) {
        log.warn('Could not fetch user views:', error)
        context.viewedProfessions = []
        context.areasExplored = []
      }

      // TODO: Get vocational test results if available
      // TODO: Get user demographic data if available
    }

    // Generate recommendations
    const engine = new RecommendationEngine(professions)
    const recommendations = engine.generateRecommendations(context, filters)

    log.info(`Generated ${recommendations.recommendations.length} recommendations for user ${authResult.userId || 'anonymous'}`)

    return createResponse({
      success: true,
      data: recommendations
    })

  } catch (error) {
    log.error('Error generating recommendations:', error)
    return createResponse({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, 500)
  }
}