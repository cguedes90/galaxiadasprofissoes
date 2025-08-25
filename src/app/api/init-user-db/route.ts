import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST() {
  try {
    // Create user_progress table if it doesn't exist (needed for gamification)
    await query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        professions_viewed TEXT[] DEFAULT '{}',
        areas_explored TEXT[] DEFAULT '{}',
        tests_completed INTEGER DEFAULT 0,
        achievements JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP
      )
    `)

    // Create user_profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        date_of_birth DATE,
        gender VARCHAR(50),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Brasil',
        bio TEXT,
        phone VARCHAR(20),
        social_links JSONB,
        interests TEXT[],
        skills JSONB[],
        languages JSONB[],
        personality_traits JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create education_info table
    await query(`
      CREATE TABLE IF NOT EXISTS education_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        current_level VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        institution VARCHAR(255),
        course VARCHAR(255),
        year INTEGER,
        expected_completion DATE,
        grades DECIMAL(3,1),
        favorite_subjects TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create professional_info table
    await query(`
      CREATE TABLE IF NOT EXISTS professional_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        current_job JSONB,
        dream_job VARCHAR(255),
        career_change_interest BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create user_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'auto',
        language VARCHAR(10) DEFAULT 'pt-BR',
        notifications JSONB,
        privacy JSONB,
        recommendation_filters JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add user_id column to user_progress if it doesn't exist
    await query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='user_progress' AND column_name='user_id'
        ) THEN
          ALTER TABLE user_progress ADD COLUMN user_id UUID REFERENCES users(id);
        END IF;
      END $$
    `)

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    await query('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_education_info_user_id ON education_info(user_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_professional_info_user_id ON professional_info(user_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id)')

    return NextResponse.json({ 
      success: true,
      message: 'Esquema do banco de dados de usuários inicializado com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao inicializar schema de usuários:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Falha ao inicializar banco de dados de usuários',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}