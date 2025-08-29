import Redis from 'ioredis'

class RedisClient {
  private client: Redis | null = null
  private isConnected = false

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully')
        this.isConnected = true
      })

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
        this.isConnected = false
      })

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed')
        this.isConnected = false
      })

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.get(key)
    } catch (error) {
      console.error('❌ Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      
      if (ttl) {
        await this.client!.setex(key, ttl, value)
      } else {
        await this.client!.set(key, value)
      }
      return true
    } catch (error) {
      console.error('❌ Redis SET error:', error)
      return false
    }
  }


  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      const result = await this.client!.exists(key)
      return result === 1
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error)
      return false
    }
  }

  async incr(key: string): Promise<number> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.incr(key)
    } catch (error) {
      console.error('❌ Redis INCR error:', error)
      return 0
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      await this.client!.expire(key, seconds)
      return true
    } catch (error) {
      console.error('❌ Redis EXPIRE error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.isConnected = false
    }
  }

  // Rate limiting helper
  async checkRateLimit(
    identifier: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = `rate_limit:${identifier}`
      const window = Math.floor(Date.now() / windowMs)
      const windowKey = `${key}:${window}`

      const current = await this.incr(windowKey)
      
      if (current === 1) {
        await this.expire(windowKey, Math.ceil(windowMs / 1000))
      }

      const allowed = current <= maxRequests
      const remaining = Math.max(0, maxRequests - current)
      const resetTime = (window + 1) * windowMs

      return { allowed, remaining, resetTime }
    } catch (error) {
      console.error('❌ Redis rate limit error:', error)
      // Fallback: allow request if Redis fails
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs }
    }
  }

  // Enhanced methods for cache-strategy integration
  async setex(key: string, seconds: number, value: string): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      await this.client!.setex(key, seconds, value)
      return true
    } catch (error) {
      console.error('❌ Redis SETEX error:', error)
      return false
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.keys(pattern)
    } catch (error) {
      console.error('❌ Redis KEYS error:', error)
      return []
    }
  }

  async del(...keys: string[]): Promise<number> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.del(...keys)
    } catch (error) {
      console.error('❌ Redis DEL error:', error)
      return 0
    }
  }

  async dbsize(): Promise<number> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.dbsize()
    } catch (error) {
      console.error('❌ Redis DBSIZE error:', error)
      return 0
    }
  }

  async info(section?: string): Promise<string> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return section ? await this.client!.info(section) : await this.client!.info()
    } catch (error) {
      console.error('❌ Redis INFO error:', error)
      return ''
    }
  }

  async flushdb(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      await this.client!.flushdb()
      return true
    } catch (error) {
      console.error('❌ Redis FLUSHDB error:', error)
      return false
    }
  }

  // Cache helper with JSON support
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('❌ Redis getJSON error:', error)
      return null
    }
  }

  async setJSON<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value), ttl)
    } catch (error) {
      console.error('❌ Redis setJSON error:', error)
      return false
    }
  }

  // Batch operations
  async mget(...keys: string[]): Promise<(string | null)[]> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.mget(...keys)
    } catch (error) {
      console.error('❌ Redis MGET error:', error)
      return new Array(keys.length).fill(null)
    }
  }

  async mset(keyValues: Record<string, string>): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      const args: string[] = []
      Object.entries(keyValues).forEach(([key, value]) => {
        args.push(key, value)
      })
      await this.client!.mset(...args)
      return true
    } catch (error) {
      console.error('❌ Redis MSET error:', error)
      return false
    }
  }

  // Connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      const result = await this.client!.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('❌ Redis PING error:', error)
      return false
    }
  }

  // Queue operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.lpush(key, ...values)
    } catch (error) {
      console.error('❌ Redis LPUSH error:', error)
      return 0
    }
  }

  async brpop(key: string, timeout: number): Promise<[string, string] | null> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.brpop(key, timeout)
    } catch (error) {
      console.error('❌ Redis BRPOP error:', error)
      return null
    }
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.zadd(key, score, member)
    } catch (error) {
      console.error('❌ Redis ZADD error:', error)
      return 0
    }
  }

  async zrangebyscore(key: string, min: number | string, max: number | string, ...args: (string | number)[]): Promise<string[]> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      // Cast arguments to expected types for ioredis
      return await (this.client!.zrangebyscore as any)(key, min, max, ...args)
    } catch (error) {
      console.error('❌ Redis ZRANGEBYSCORE error:', error)
      return []
    }
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      if (!this.client || !this.isConnected) {
        await this.client?.connect()
      }
      return await this.client!.zrem(key, ...members)
    } catch (error) {
      console.error('❌ Redis ZREM error:', error)
      return 0
    }
  }
}

export const redis = new RedisClient()
export default redis