import { redis } from './redis'
import { log } from './logger'
import { EmailService } from './email-service'
import { analytics } from './analytics'
import { RegisterData } from '@/types/user'

export interface Job {
  id: string
  type: 'send_email' | 'track_event' | 'warm_cache'
  data: any
  attempts: number
  maxAttempts: number
  createdAt: Date
  processAfter?: Date
  priority: 'low' | 'normal' | 'high'
}

export interface EmailJobData {
  type: 'welcome' | 'reset' | 'test'
  email: string
  userName?: string
  userData?: RegisterData
  resetToken?: string
  appUrl: string
}

export interface AnalyticsJobData {
  eventName: string
  userId?: string
  properties?: Record<string, any>
}

export interface CacheJobData {
  operation: 'warm_professions' | 'warm_stats' | 'warm_search'
  params?: any
}

/**
 * Background job queue system using Redis
 * Provides reliable job processing with retry logic and error handling
 */
export class JobQueue {
  private static readonly QUEUES = {
    HIGH_PRIORITY: 'jobs:high',
    NORMAL_PRIORITY: 'jobs:normal',
    LOW_PRIORITY: 'jobs:low',
    PROCESSING: 'jobs:processing',
    FAILED: 'jobs:failed',
    COMPLETED: 'jobs:completed'
  } as const

  private static readonly JOB_TTL = {
    PROCESSING: 300, // 5 minutes
    FAILED: 86400,   // 24 hours
    COMPLETED: 3600  // 1 hour
  } as const

  /**
   * Add a job to the queue
   */
  static async addJob(job: Omit<Job, 'id' | 'createdAt' | 'attempts'>): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const fullJob: Job = {
      ...job,
      id: jobId,
      createdAt: new Date(),
      attempts: 0
    }

    try {
      const queueName = this.getQueueByPriority(job.priority)
      const jobJson = JSON.stringify(fullJob)
      
      if (job.processAfter) {
        // Delayed job - store in a separate sorted set
        const delay = job.processAfter.getTime()
        await redis.setex(`job:delayed:${jobId}`, 3600, jobJson)
        await redis.zadd('jobs:delayed', delay, jobId)
      } else {
        // Immediate job - add to appropriate priority queue
        await redis.lpush(queueName, jobJson)
      }

      log.info('Job added to queue', {
        jobId,
        type: job.type,
        priority: job.priority,
        queue: queueName,
        delayed: !!job.processAfter
      })

      return jobId
    } catch (error) {
      log.error('Failed to add job to queue', error)
      throw new Error('Failed to queue job')
    }
  }

  /**
   * Add email job
   */
  static async addEmailJob(data: EmailJobData, priority: Job['priority'] = 'normal'): Promise<string> {
    return this.addJob({
      type: 'send_email',
      data,
      priority,
      maxAttempts: 3
    })
  }

  /**
   * Add analytics job
   */
  static async addAnalyticsJob(data: AnalyticsJobData, priority: Job['priority'] = 'low'): Promise<string> {
    return this.addJob({
      type: 'track_event',
      data,
      priority,
      maxAttempts: 2
    })
  }

  /**
   * Add cache warming job
   */
  static async addCacheJob(data: CacheJobData, priority: Job['priority'] = 'low'): Promise<string> {
    return this.addJob({
      type: 'warm_cache',
      data,
      priority,
      maxAttempts: 1
    })
  }

  /**
   * Process jobs from queues (main worker loop)
   */
  static async processJobs(concurrency: number = 5): Promise<void> {
    log.info('Starting job processor', { concurrency })

    const workers = Array.from({ length: concurrency }, (_, i) => 
      this.workerLoop(`worker-${i}`)
    )

    // Also start delayed job processor
    const delayedProcessor = this.processDelayedJobs()

    await Promise.all([...workers, delayedProcessor])
  }

  /**
   * Individual worker loop
   */
  private static async workerLoop(workerId: string): Promise<void> {
    while (true) {
      try {
        const job = await this.getNextJob()
        
        if (job) {
          await this.processJob(job, workerId)
        } else {
          // No jobs available, wait a bit
          await this.sleep(1000)
        }
      } catch (error) {
        log.error('Worker error', { error, workerId })
        await this.sleep(5000) // Wait longer on error
      }
    }
  }

  /**
   * Get next job from priority queues
   */
  private static async getNextJob(): Promise<Job | null> {
    try {
      // Check queues in priority order
      const queues = [
        this.QUEUES.HIGH_PRIORITY,
        this.QUEUES.NORMAL_PRIORITY,
        this.QUEUES.LOW_PRIORITY
      ]

      for (const queue of queues) {
        const jobJson = await redis.brpop(queue, 5) // 5 second timeout
        if (jobJson && jobJson[1]) {
          return JSON.parse(jobJson[1])
        }
      }

      return null
    } catch (error) {
      log.error('Error getting next job', error)
      return null
    }
  }

  /**
   * Process a single job
   */
  private static async processJob(job: Job, workerId: string): Promise<void> {
    const startTime = Date.now()
    job.attempts++

    log.info('Processing job', {
      jobId: job.id,
      type: job.type,
      attempt: job.attempts,
      workerId
    })

    try {
      // Move job to processing queue
      await redis.setex(`${this.QUEUES.PROCESSING}:${job.id}`, this.JOB_TTL.PROCESSING, JSON.stringify(job))

      // Process based on job type
      let success = false

      switch (job.type) {
        case 'send_email':
          success = await this.processEmailJob(job)
          break
        case 'track_event':
          success = await this.processAnalyticsJob(job)
          break
        case 'warm_cache':
          success = await this.processCacheJob(job)
          break
        default:
          log.error('Unknown job type', { jobId: job.id, type: job.type })
          success = false
      }

      const duration = Date.now() - startTime

      if (success) {
        // Job completed successfully
        await this.markJobCompleted(job, duration, workerId)
      } else {
        // Job failed, potentially retry
        await this.handleJobFailure(job, workerId)
      }

      // Remove from processing queue
      await redis.del(`${this.QUEUES.PROCESSING}:${job.id}`)

    } catch (error) {
      log.error('Job processing error', { error, jobId: job.id, workerId })
      await this.handleJobFailure(job, workerId, error as Error)
    }
  }

  /**
   * Process email job
   */
  private static async processEmailJob(job: Job): Promise<boolean> {
    try {
      const { data } = job
      let success = false

      switch (data.type) {
        case 'welcome':
          if (data.userData) {
            success = await EmailService.sendWelcomeEmail(data.userData, data.appUrl)
          }
          break
        case 'reset':
          if (data.userName && data.resetToken) {
            success = await EmailService.sendPasswordResetEmail(
              data.email, 
              data.userName, 
              data.resetToken, 
              data.appUrl
            )
          }
          break
        case 'test':
          success = await EmailService.sendTestEmail(data.email, data.appUrl)
          break
      }

      return success
    } catch (error) {
      log.error('Email job processing error', error)
      return false
    }
  }

  /**
   * Process analytics job
   */
  private static async processAnalyticsJob(job: Job): Promise<boolean> {
    try {
      const { data } = job
      
      if (data.userId) {
        analytics.identify(data.userId)
      }
      
      analytics.track(data.eventName, data.properties)
      return true
    } catch (error) {
      log.error('Analytics job processing error', error)
      return false
    }
  }

  /**
   * Process cache job
   */
  private static async processCacheJob(job: Job): Promise<boolean> {
    try {
      const { getCachedProfessions, getCachedStats, warmCache } = await import('./cache-strategy')
      
      switch (job.data.operation) {
        case 'warm_professions':
          await getCachedProfessions()
          break
        case 'warm_stats':
          await getCachedStats()
          break
        case 'warm_search':
          await warmCache()
          break
      }
      
      return true
    } catch (error) {
      log.error('Cache job processing error', error)
      return false
    }
  }

  /**
   * Handle job failure and retry logic
   */
  private static async handleJobFailure(job: Job, workerId: string, error?: Error): Promise<void> {
    if (job.attempts < job.maxAttempts) {
      // Retry with exponential backoff
      const delay = Math.pow(2, job.attempts) * 1000 // 2s, 4s, 8s, etc.
      const retryTime = new Date(Date.now() + delay)
      
      log.warn('Job failed, scheduling retry', {
        jobId: job.id,
        attempt: job.attempts,
        maxAttempts: job.maxAttempts,
        retryAt: retryTime,
        workerId
      })

      // Re-queue with delay
      const queueName = this.getQueueByPriority(job.priority)
      setTimeout(async () => {
        await redis.lpush(queueName, JSON.stringify(job))
      }, delay)

    } else {
      // Max attempts exceeded, mark as failed
      log.error('Job permanently failed', {
        jobId: job.id,
        attempts: job.attempts,
        workerId,
        error: error?.message
      })

      await redis.setex(
        `${this.QUEUES.FAILED}:${job.id}`,
        this.JOB_TTL.FAILED,
        JSON.stringify({ ...job, failedAt: new Date(), error: error?.message })
      )
    }
  }

  /**
   * Mark job as completed
   */
  private static async markJobCompleted(job: Job, duration: number, workerId: string): Promise<void> {
    log.info('Job completed successfully', {
      jobId: job.id,
      type: job.type,
      duration: `${duration}ms`,
      workerId
    })

    await redis.setex(
      `${this.QUEUES.COMPLETED}:${job.id}`,
      this.JOB_TTL.COMPLETED,
      JSON.stringify({ ...job, completedAt: new Date(), duration })
    )
  }

  /**
   * Process delayed jobs
   */
  private static async processDelayedJobs(): Promise<void> {
    while (true) {
      try {
        const now = Date.now()
        const delayedJobs = await redis.zrangebyscore('jobs:delayed', 0, now, 'LIMIT', 0, 10)
        
        for (const jobId of delayedJobs) {
          const jobData = await redis.get(`job:delayed:${jobId}`)
          if (jobData) {
            const job: Job = JSON.parse(jobData)
            const queueName = this.getQueueByPriority(job.priority)
            
            await redis.lpush(queueName, jobData)
            await redis.zrem('jobs:delayed', jobId)
            await redis.del(`job:delayed:${jobId}`)
            
            log.info('Delayed job moved to processing queue', { jobId, type: job.type })
          }
        }
        
        await this.sleep(5000) // Check every 5 seconds
      } catch (error) {
        log.error('Delayed job processor error', error)
        await this.sleep(10000) // Wait longer on error
      }
    }
  }

  /**
   * Get queue name by priority
   */
  private static getQueueByPriority(priority: Job['priority']): string {
    switch (priority) {
      case 'high': return this.QUEUES.HIGH_PRIORITY
      case 'normal': return this.QUEUES.NORMAL_PRIORITY
      case 'low': return this.QUEUES.LOW_PRIORITY
      default: return this.QUEUES.NORMAL_PRIORITY
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    try {
      const [highCount, normalCount, lowCount, processingKeys, failedKeys] = await Promise.all([
        redis.get(this.QUEUES.HIGH_PRIORITY).then(() => 0).catch(() => 0), // Simplified for now
        redis.get(this.QUEUES.NORMAL_PRIORITY).then(() => 0).catch(() => 0),
        redis.get(this.QUEUES.LOW_PRIORITY).then(() => 0).catch(() => 0),
        redis.keys(`${this.QUEUES.PROCESSING}:*`),
        redis.keys(`${this.QUEUES.FAILED}:*`)
      ])
      
      const processingCount = processingKeys.length
      const failedCount = failedKeys.length

      return {
        queued: {
          high: highCount,
          normal: normalCount,
          low: lowCount,
          total: highCount + normalCount + lowCount
        },
        processing: processingCount,
        failed: failedCount
      }
    } catch (error) {
      log.error('Error getting queue stats', error)
      return null
    }
  }

  /**
   * Clear all queues (use with caution!)
   */
  static async clearQueues(): Promise<void> {
    await Promise.all([
      redis.del(this.QUEUES.HIGH_PRIORITY),
      redis.del(this.QUEUES.NORMAL_PRIORITY),
      redis.del(this.QUEUES.LOW_PRIORITY)
    ])
    
    log.warn('All job queues cleared')
  }

  /**
   * Utility sleep function
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export convenience functions
export const {
  addEmailJob,
  addAnalyticsJob,
  addCacheJob,
  getQueueStats,
  processJobs
} = JobQueue