-- Create users table
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
);

-- Create user_profiles table
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
);

-- Create education_info table
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
);

-- Create professional_info table
CREATE TABLE IF NOT EXISTS professional_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    current_job JSONB,
    dream_job VARCHAR(255),
    career_change_interest BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create work_experiences table
CREATE TABLE IF NOT EXISTS work_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    skills TEXT[],
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create career_goals table
CREATE TABLE IF NOT EXISTS career_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timeframe VARCHAR(20) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50) NOT NULL,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
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
);

-- Update user_progress table to reference users
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_education_info_user_id ON education_info(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_info_user_id ON professional_info(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_user_id ON work_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON career_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insert default preferences template
INSERT INTO user_preferences (
    user_id, 
    notifications,
    privacy,
    recommendation_filters
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Template ID
    '{
        "email": true,
        "push": false,
        "achievements": true,
        "journeys": true,
        "recommendations": true,
        "newsletter": false
    }',
    '{
        "profileVisibility": "public",
        "shareProgress": true,
        "shareAchievements": true,
        "allowRecommendations": true,
        "dataCollection": true
    }',
    '{
        "salaryRange": {"min": 1000, "max": 50000},
        "workMode": ["remote", "hybrid", "presential"],
        "regions": ["Brasil"]
    }'
) ON CONFLICT DO NOTHING;