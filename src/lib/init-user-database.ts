import { query } from './database'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function initializeUserDatabase() {
  try {
    // Read and execute the SQL file
    const sqlPath = join(process.cwd(), 'src', 'lib', 'init-users-db.sql')
    const sql = readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon to execute each statement individually
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    
    for (const statement of statements) {
      await query(statement)
      console.log('Executed:', statement.trim().substring(0, 50) + '...')
    }
    
    console.log('✓ User database schema initialized successfully')
    return true
  } catch (error) {
    console.error('✗ Error initializing user database:', error)
    return false
  }
}