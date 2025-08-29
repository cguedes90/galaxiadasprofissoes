import { NextRequest } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
  let testPool: Pool | null = null
  
  try {
    console.log('🔧 Force testing with environment connection...')
    
    // Use environment variable for security
    const connectionString = process.env.DATABASE_URL
    
    testPool = new Pool({
      connectionString,
      max: 5,
      min: 0,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      ssl: {
        rejectUnauthorized: false
      }
    })

    console.log('1. Pool created with environment connection')

    // Test connection
    const client = await testPool.connect()
    console.log('2. Connected successfully')

    // Count professions
    const professionsResult = await client.query('SELECT COUNT(*) as count FROM professions')
    const professionCount = parseInt(professionsResult.rows[0].count)
    console.log('3. Found', professionCount, 'professions')

    // Get some professions
    const professionsData = await client.query('SELECT id, name, area FROM professions LIMIT 10')
    console.log('4. Sample professions:', professionsData.rows)

    client.release()

    return Response.json({
      success: true,
      data: {
        connection: 'successful with environment variable',
        professionCount,
        sampleProfessions: professionsData.rows,
        environment_check: {
          DATABASE_URL_exists: !!process.env.DATABASE_URL,
          DATABASE_URL_value: process.env.DATABASE_URL?.substring(0, 50) + '...',
          NODE_ENV: process.env.NODE_ENV
        }
      },
      message: 'Forced connection test successful'
    })

  } catch (error) {
    console.error('❌ Forced connection test failed:', error)
    
    return Response.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        environment_check: {
          DATABASE_URL_exists: !!process.env.DATABASE_URL,
          DATABASE_URL_value: process.env.DATABASE_URL?.substring(0, 50) + '...',
          NODE_ENV: process.env.NODE_ENV
        }
      }
    }, { status: 500 })

  } finally {
    if (testPool) {
      await testPool.end()
    }
  }
}