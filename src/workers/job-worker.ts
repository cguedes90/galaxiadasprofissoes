#!/usr/bin/env ts-node

/**
 * Background Job Worker
 * Processes jobs from Redis queues
 * 
 * Usage:
 * - Development: npm run worker
 * - Production: node dist/workers/job-worker.js
 * - Docker: docker exec container npm run worker
 */

import { processJobs } from '../lib/queue-system'
import { log } from '../lib/logger'
import { warmCache } from '../lib/cache-strategy'

// Environment configuration
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '3')
const WORKER_NAME = process.env.WORKER_NAME || 'job-worker'

// Graceful shutdown handler
let isShuttingDown = false

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGQUIT', gracefulShutdown)

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return

  log.info('Received shutdown signal, starting graceful shutdown...', { signal })
  isShuttingDown = true

  // Give workers time to finish current jobs
  setTimeout(() => {
    log.info('Shutdown timeout reached, forcing exit')
    process.exit(1)
  }, 30000) // 30 second timeout

  try {
    log.info('Worker shutdown completed successfully')
    process.exit(0)
  } catch (error) {
    log.error('Error during worker shutdown', error)
    process.exit(1)
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception in worker process', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection in worker process', { reason, promise })
  process.exit(1)
})

async function startWorker() {
  try {
    log.info('Starting background job worker', {
      workerName: WORKER_NAME,
      concurrency: WORKER_CONCURRENCY,
      nodeEnv: process.env.NODE_ENV,
      pid: process.pid
    })

    // Warm cache on startup
    try {
      await warmCache()
      log.info('Cache warmed successfully')
    } catch (cacheError) {
      log.warn('Cache warming failed, continuing anyway', cacheError)
    }

    // Health check interval
    setInterval(() => {
      if (!isShuttingDown) {
        log.debug('Worker health check', {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid
        })
      }
    }, 60000) // Every minute

    // Start processing jobs
    await processJobs(WORKER_CONCURRENCY)

  } catch (error) {
    log.error('Failed to start worker', error)
    process.exit(1)
  }
}

// Main execution
if (require.main === module) {
  startWorker().catch((error) => {
    log.error('Worker startup failed', error)
    process.exit(1)
  })
}

export { startWorker }