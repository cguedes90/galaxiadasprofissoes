import { NextRequest } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initializing database tables...')
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT,
        is_active BOOLEAN DEFAULT true,
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      )
    `)
    console.log('✅ Users table created/verified')

    // Create professions table
    await query(`
      CREATE TABLE IF NOT EXISTS professions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        area VARCHAR(100) NOT NULL,
        required_education TEXT,
        salary_min INTEGER DEFAULT 0,
        salary_max INTEGER DEFAULT 0,
        formation_time VARCHAR(50),
        main_activities TEXT[] DEFAULT '{}',
        certifications TEXT[] DEFAULT '{}',
        related_professions TEXT[] DEFAULT '{}',
        icon_color VARCHAR(7) DEFAULT '#ffffff',
        x_position INTEGER DEFAULT 0,
        y_position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Professions table created/verified')

    // Create user_profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        date_of_birth DATE,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Brasil',
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ User profiles table created/verified')

    // Create education_info table
    await query(`
      CREATE TABLE IF NOT EXISTS education_info (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        current_level VARCHAR(100),
        status VARCHAR(50),
        institution VARCHAR(255),
        course VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Education info table created/verified')

    // Create professional_info table
    await query(`
      CREATE TABLE IF NOT EXISTS professional_info (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50),
        dream_job VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Professional info table created/verified')

    // Create user_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'auto',
        language VARCHAR(10) DEFAULT 'pt-BR',
        notifications JSONB DEFAULT '{"email": true, "push": false}',
        privacy JSONB DEFAULT '{"profileVisibility": "public"}',
        recommendation_filters JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ User preferences table created/verified')

    // Create user_progress table
    await query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        professions_viewed TEXT[] DEFAULT '{}',
        areas_explored TEXT[] DEFAULT '{}',
        tests_completed INTEGER DEFAULT 0,
        achievements JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ User progress table created/verified')

    // Check if professions exist, if not add some basic ones
    const professionCount = await query('SELECT COUNT(*) as count FROM professions')
    const count = parseInt(professionCount.rows[0].count)
    
    if (count === 0) {
      console.log('📝 Adding initial professions...')
      
      const initialProfessions = [
        {
          name: 'Desenvolvedor Full Stack',
          description: 'Profissional que desenvolve tanto o front-end quanto o back-end de aplicações web',
          area: 'Tecnologia',
          required_education: 'Ensino Superior em Ciência da Computação ou áreas correlatas',
          salary_min: 4000,
          salary_max: 15000,
          formation_time: '4-5 anos',
          main_activities: ['Desenvolvimento de interfaces', 'Criação de APIs', 'Gerenciamento de banco de dados'],
          certifications: ['Certificações em frameworks web', 'AWS Certified Developer'],
          related_professions: ['Desenvolvedor Front-end', 'Desenvolvedor Back-end'],
          icon_color: '#00d4aa',
          x_position: 100,
          y_position: 150
        },
        {
          name: 'Médico Cardiologista',
          description: 'Especialista em diagnóstico e tratamento de doenças do coração',
          area: 'Saúde',
          required_education: 'Graduação em Medicina + Residência em Cardiologia',
          salary_min: 8000,
          salary_max: 25000,
          formation_time: '9-10 anos',
          main_activities: ['Consultas médicas', 'Exames cardiológicos', 'Cirurgias cardíacas'],
          certifications: ['CRM', 'Título de Especialista em Cardiologia'],
          related_professions: ['Cirurgião Cardíaco', 'Clínico Geral'],
          icon_color: '#ff6b6b',
          x_position: 200,
          y_position: 100
        },
        {
          name: 'Designer UX/UI',
          description: 'Profissional responsável pela experiência do usuário e design de interfaces',
          area: 'Design',
          required_education: 'Ensino Superior em Design ou áreas correlatas',
          salary_min: 3000,
          salary_max: 12000,
          formation_time: '4 anos',
          main_activities: ['Pesquisa com usuários', 'Criação de wireframes', 'Prototipação'],
          certifications: ['Certificação em Design Thinking', 'UX Certification'],
          related_professions: ['Product Designer', 'Designer Gráfico'],
          icon_color: '#9c88ff',
          x_position: 150,
          y_position: 200
        }
      ]

      for (const prof of initialProfessions) {
        await query(`
          INSERT INTO professions (
            name, description, area, required_education, salary_min, salary_max,
            formation_time, main_activities, certifications, related_professions,
            icon_color, x_position, y_position
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          prof.name, prof.description, prof.area, prof.required_education,
          prof.salary_min, prof.salary_max, prof.formation_time,
          prof.main_activities, prof.certifications, prof.related_professions,
          prof.icon_color, prof.x_position, prof.y_position
        ])
      }
      console.log('✅ Initial professions added')
    }

    return Response.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        professionCount: count,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return Response.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}