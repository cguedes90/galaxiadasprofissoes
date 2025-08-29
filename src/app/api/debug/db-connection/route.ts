import { NextRequest } from 'next/server'
import { query, healthCheck } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test 1: Basic health check
    const isHealthy = await healthCheck()
    console.log('Health check result:', isHealthy)
    
    // Test 2: Count professions
    let professionCount = 0
    try {
      const professionResult = await query('SELECT COUNT(*) as count FROM professions')
      professionCount = parseInt(professionResult.rows[0]?.count || '0')
      console.log('Professions count:', professionCount)
    } catch (professionError) {
      console.error('Error counting professions:', professionError)
    }
    
    // Test 3: Count users 
    let userCount = 0
    try {
      const userResult = await query('SELECT COUNT(*) as count FROM users')
      userCount = parseInt(userResult.rows[0]?.count || '0')
      console.log('Users count:', userCount)
    } catch (userError) {
      console.error('Error counting users:', userError)
    }
    
    // Test 4: List all tables
    let tables: string[] = []
    try {
      const tablesResult = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)
      tables = tablesResult.rows.map(row => row.table_name)
      console.log('Available tables:', tables)
    } catch (tablesError) {
      console.error('Error listing tables:', tablesError)
    }
    
    return Response.json({
      success: true,
      data: {
        healthy: isHealthy,
        professionCount,
        userCount,
        availableTables: tables,
        timestamp: new Date().toISOString()
      },
      message: 'Database connection test completed'
    })
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return Response.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown database error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}