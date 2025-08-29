import { redis } from './redis'
import { query } from './database'
import { log } from './logger'
import { Profession } from '@/types/profession'

/**
 * Multi-layer caching strategy for improved performance
 * Level 1: Application cache (1-5min) - Frequently accessed data
 * Level 2: Session cache (5-15min) - User-specific data  
 * Level 3: Content cache (15-60min) - Static/semi-static content
 */

export class CacheStrategy {
  private static readonly CACHE_PREFIXES = {
    PROFESSIONS: 'professions',
    USER: 'user', 
    STATS: 'stats',
    SEARCH: 'search',
    SESSION: 'session'
  } as const

  /**
   * Level 1 Cache: Frequently accessed professions data (1min TTL)
   */
  static async getCachedProfessions(
    filters?: { area?: string; limit?: number; offset?: number }
  ): Promise<Profession[]> {
    const cacheKey = filters 
      ? `${this.CACHE_PREFIXES.PROFESSIONS}:filtered:${JSON.stringify(filters)}`
      : `${this.CACHE_PREFIXES.PROFESSIONS}:all`
    
    try {
      // Try to get from cache first (only if Redis is working)
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          log.debug('Cache hit for professions', { cacheKey, source: 'redis' })
          return JSON.parse(cached)
        }
      } catch (redisError) {
        log.warn('Redis unavailable, skipping cache check', redisError)
      }

      // Cache miss or Redis unavailable - fetch from database
      log.debug('Fetching professions from database', { cacheKey })
      
      let queryText = 'SELECT * FROM professions'
      const params: any[] = []
      let paramCount = 0

      if (filters?.area) {
        queryText += ' WHERE area = $' + (++paramCount)
        params.push(filters.area)
      }

      queryText += ' ORDER BY created_at DESC'
      
      if (filters?.limit) {
        queryText += ' LIMIT $' + (++paramCount)
        params.push(filters.limit)
      }
      
      if (filters?.offset) {
        queryText += ' OFFSET $' + (++paramCount) 
        params.push(filters.offset)
      }

      const result = await query(queryText, params)
      const professions = result.rows

      // Try to cache for 1 minute (only if Redis is working)
      try {
        await redis.setex(cacheKey, 60, JSON.stringify(professions))
        log.debug('Professions cached successfully', { 
          cacheKey, 
          count: professions.length,
          ttl: 60 
        })
      } catch (redisError) {
        log.warn('Redis unavailable, skipping cache storage', redisError)
      }

      log.info('Professions fetched from database', { 
        count: professions.length,
        cached: false 
      })

      return professions
    } catch (error) {
      log.error('Error fetching professions', error)
      throw error
    }
  }

  /**
   * Level 1 Cache: Popular professions (5min TTL)
   */
  static async getPopularProfessions(limit: number = 10): Promise<Profession[]> {
    const cacheKey = `${this.CACHE_PREFIXES.PROFESSIONS}:popular:${limit}`
    
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        log.debug('Cache hit for popular professions', { cacheKey })
        return JSON.parse(cached)
      }

      // Fetch most viewed professions (simulated with random for now)
      const result = await query(`
        SELECT p.*, COALESCE(stats.view_count, 0) as view_count
        FROM professions p
        LEFT JOIN (
          SELECT profession_id, COUNT(*) as view_count 
          FROM user_progress 
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY profession_id
        ) stats ON p.id = stats.profession_id
        ORDER BY stats.view_count DESC NULLS LAST, p.created_at DESC
        LIMIT $1
      `, [limit])

      const professions = result.rows

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(professions))
      
      log.info('Popular professions cached', { count: professions.length })
      return professions
    } catch (error) {
      log.error('Cache error for popular professions', error)
      
      // Fallback
      const result = await query('SELECT * FROM professions ORDER BY created_at DESC LIMIT $1', [limit])
      return result.rows
    }
  }

  /**
   * Level 2 Cache: User session data (15min TTL)
   */
  static async getCachedUserProgress(userId: string) {
    const cacheKey = `${this.CACHE_PREFIXES.USER}:${userId}:progress`
    
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const result = await query(`
        SELECT up.*, p.name as profession_name, p.area
        FROM user_progress up
        JOIN professions p ON up.profession_id = p.id
        WHERE up.user_id = $1
        ORDER BY up.updated_at DESC
        LIMIT 50
      `, [userId])

      const progress = result.rows

      // Cache for 15 minutes
      await redis.setex(cacheKey, 900, JSON.stringify(progress))
      
      return progress
    } catch (error) {
      log.error('Cache error for user progress', error)
      return []
    }
  }

  /**
   * Level 2 Cache: User profile data (15min TTL) 
   */
  static async getCachedUserProfile(userId: string) {
    const cacheKey = `${this.CACHE_PREFIXES.USER}:${userId}:profile`
    
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const result = await query(`
        SELECT u.id, u.email, u.name, u.avatar, u.created_at, u.last_login,
               up.full_name, up.date_of_birth, up.city, up.state, up.bio,
               ei.current_level, ei.status as education_status, ei.institution,
               pi.status as professional_status, pi.dream_job
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN education_info ei ON u.id = ei.user_id  
        LEFT JOIN professional_info pi ON u.id = pi.user_id
        WHERE u.id = $1
      `, [userId])

      const profile = result.rows[0] || null

      if (profile) {
        // Cache for 15 minutes
        await redis.setex(cacheKey, 900, JSON.stringify(profile))
      }
      
      return profile
    } catch (error) {
      log.error('Cache error for user profile', error)
      return null
    }
  }

  /**
   * Level 3 Cache: Application statistics (1hour TTL)
   */
  static async getCachedStats() {
    const cacheKey = `${this.CACHE_PREFIXES.STATS}:app`
    
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const [
        totalProfessions,
        totalUsers, 
        totalAreas,
        recentActivity
      ] = await Promise.all([
        query('SELECT COUNT(*) as count FROM professions'),
        query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
        query('SELECT COUNT(DISTINCT area) as count FROM professions'),
        query(`SELECT COUNT(*) as count FROM user_progress 
               WHERE created_at >= NOW() - INTERVAL '24 hours'`)
      ])

      const stats = {
        totalProfessions: parseInt(totalProfessions.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalAreas: parseInt(totalAreas.rows[0].count),
        dailyActivity: parseInt(recentActivity.rows[0].count),
        updatedAt: new Date().toISOString()
      }

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(stats))
      
      log.info('App stats cached', stats)
      return stats
    } catch (error) {
      log.error('Cache error for app stats', error)
      return {
        totalProfessions: 0,
        totalUsers: 0, 
        totalAreas: 0,
        dailyActivity: 0,
        updatedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Level 3 Cache: Search results (5min TTL)
   */
  static async getCachedSearchResults(searchQuery: string, filters?: any) {
    const cacheKey = `${this.CACHE_PREFIXES.SEARCH}:${searchQuery}:${JSON.stringify(filters || {})}`
    
    try {
      // Try to get from cache first (only if Redis is working)
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          log.debug('Cache hit for search results', { searchQuery })
          return JSON.parse(cached)
        }
      } catch (redisError) {
        log.warn('Redis unavailable for search cache, skipping cache check', redisError)
      }

      // Cache miss or Redis unavailable - fetch from database
      let queryText = `
        SELECT *, 
               CASE 
                 WHEN name ILIKE $1 THEN 3
                 WHEN description ILIKE $1 THEN 2  
                 WHEN area ILIKE $1 THEN 1
                 ELSE 0
               END as relevance_score
        FROM professions 
        WHERE (name ILIKE $1 OR description ILIKE $1 OR area ILIKE $1)
      `
      
      const searchPattern = `%${searchQuery}%`
      const params = [searchPattern]

      if (filters?.area) {
        queryText += ' AND area = $2'
        params.push(filters.area)
      }

      queryText += ' ORDER BY relevance_score DESC, created_at DESC LIMIT 20'

      const result = await query(queryText, params)
      const searchResults = result.rows

      // Try to cache for 5 minutes (only if Redis is working)
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(searchResults))
        log.debug('Search results cached successfully', { 
          searchQuery, 
          resultCount: searchResults.length 
        })
      } catch (redisError) {
        log.warn('Redis unavailable, skipping search cache storage', redisError)
      }

      log.info('Search results fetched from database', { 
        searchQuery, 
        resultCount: searchResults.length 
      })

      return searchResults
    } catch (error) {
      log.error('Error fetching search results', error)
      throw error
    }
  }

  /**
   * Cache invalidation methods
   */
  static async invalidateProfessionCache() {
    try {
      const keys = await redis.keys(`${this.CACHE_PREFIXES.PROFESSIONS}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
        log.info('Profession cache invalidated', { deletedKeys: keys.length })
      }
    } catch (error) {
      log.error('Error invalidating profession cache', error)
    }
  }

  static async invalidateUserCache(userId: string) {
    try {
      const keys = await redis.keys(`${this.CACHE_PREFIXES.USER}:${userId}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
        log.info('User cache invalidated', { userId, deletedKeys: keys.length })
      }
    } catch (error) {
      log.error('Error invalidating user cache', error)
    }
  }

  static async invalidateSearchCache() {
    try {
      const keys = await redis.keys(`${this.CACHE_PREFIXES.SEARCH}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
        log.info('Search cache invalidated', { deletedKeys: keys.length })
      }
    } catch (error) {
      log.error('Error invalidating search cache', error)
    }
  }

  /**
   * Cache warming - pre-populate frequently accessed data
   */
  static async warmCache() {
    try {
      log.info('Starting cache warming...')
      
      // Warm most common data
      await Promise.all([
        this.getCachedProfessions(), // All professions
        this.getPopularProfessions(20), // Top 20 popular
        this.getCachedStats(), // App statistics
        this.getCachedProfessions({ area: 'Tecnologia', limit: 10 }), // Tech professions
        this.getCachedProfessions({ area: 'Saúde', limit: 10 }), // Health professions
      ])
      
      log.info('Cache warming completed successfully')
    } catch (error) {
      log.error('Error during cache warming', error)
    }
  }

  /**
   * Cache health check
   */
  static async getCacheHealth() {
    try {
      const info = await redis.info('memory')
      const keyCount = await redis.dbsize()
      
      return {
        connected: true,
        keyCount,
        memoryInfo: info,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Export convenience functions
export const {
  getCachedProfessions,
  getPopularProfessions, 
  getCachedUserProgress,
  getCachedUserProfile,
  getCachedStats,
  getCachedSearchResults,
  invalidateProfessionCache,
  invalidateUserCache,
  invalidateSearchCache,
  warmCache,
  getCacheHealth
} = CacheStrategy