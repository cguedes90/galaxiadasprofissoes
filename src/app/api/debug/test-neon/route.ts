import { NextRequest } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
  let testPool: Pool | null = null
  
  try {
    console.log('🔍 Testing Neon connection directly...')
    
    // Test with exact connection string
    const connectionString = "postgresql://neondb_owner:npg_3nEFWgyPH9wa@ep-dawn-tooth-acu3fhe9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
    
    testPool = new Pool({
      connectionString,
      max: 1,
      min: 0,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 15000,
      ssl: {
        rejectUnauthorized: false
      }
    })

    console.log('1. Pool created successfully')

    // Test basic connection
    const client = await testPool.connect()
    console.log('2. Client connection established')

    // Test simple query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version')
    console.log('3. Test query executed:', result.rows[0])

    // Test if professions table exists
    let professionsExist = false
    try {
      const professionsTest = await client.query("SELECT COUNT(*) as count FROM professions")
      professionsExist = true
      console.log('4. Professions table exists with', professionsTest.rows[0].count, 'records')
    } catch (profError) {
      console.log('4. Professions table does not exist:', profError.message)
    }

    // Test if users table exists
    let usersExist = false
    try {
      const usersTest = await client.query("SELECT COUNT(*) as count FROM users")
      usersExist = true
      console.log('5. Users table exists with', usersTest.rows[0].count, 'records')
    } catch (userError) {
      console.log('5. Users table does not exist:', userError.message)
    }

    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log('6. Available tables:', tablesResult.rows)

    client.release()

    return Response.json({
      success: true,
      data: {
        connection: 'successful',
        database_time: result.rows[0].current_time,
        postgres_version: result.rows[0].pg_version,
        tables: tablesResult.rows,
        professions_exist: professionsExist,
        users_exist: usersExist,
        connection_string_used: connectionString
      },
      message: 'Neon connection test successful'
    })

  } catch (error) {
    console.error('❌ Neon connection test failed:', error)
    
    let errorDetails = 'Unknown error'
    if (error instanceof Error) {
      errorDetails = error.message
      console.error('Error details:', {
        message: error.message,
        code: (error as any).code,
        detail: (error as any).detail,
        hint: (error as any).hint,
        stack: error.stack
      })
    }

    return Response.json({
      success: false,
      error: {
        message: 'Failed to connect to Neon database',
        details: errorDetails,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })

  } finally {
    if (testPool) {
      await testPool.end()
      console.log('Pool closed')
    }
  }
}