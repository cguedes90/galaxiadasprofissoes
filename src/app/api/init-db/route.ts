import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    // Initialize professions database
    const professionsSqlPath = path.join(process.cwd(), 'src', 'lib', 'init-db.sql')
    const professionsSql = fs.readFileSync(professionsSqlPath, 'utf8')
    await query(professionsSql)
    
    // Initialize users database
    const usersSqlPath = path.join(process.cwd(), 'src', 'lib', 'init-users-db.sql')
    const usersSql = fs.readFileSync(usersSqlPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = usersSql.split(';').filter(s => s.trim().length > 0)
    
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement)
      }
    }
    
    return NextResponse.json({ 
      message: 'Banco de dados (profissões e usuários) inicializado com sucesso' 
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      error: 'Falha ao inicializar banco de dados', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}