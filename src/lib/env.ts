const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
} as const

const optionalEnvVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@galaxiaprofissoes.com',
  EMAIL_API_KEY: process.env.EMAIL_API_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const

function validateEnvVars() {
  // Skip validation during build time in CI/CD environments
  if (process.env.VERCEL || process.env.CI) {
    return
  }
  
  const missing: string[] = []
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    }
  }
  
  if (missing.length > 0) {
    // In production, log warning but don't crash the app
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        `Warning: Missing environment variables in production: ${missing.join(', ')}\n` +
        `Some features may not work correctly.`
      )
      return
    }
    
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    )
  }
  
  if (requiredEnvVars.JWT_SECRET && requiredEnvVars.JWT_SECRET.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Warning: JWT_SECRET should be at least 32 characters long for security')
      return
    }
    
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security reasons'
    )
  }
}

validateEnvVars()

export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
  isDevelopment: optionalEnvVars.NODE_ENV === 'development',
  isProduction: optionalEnvVars.NODE_ENV === 'production',
  isTest: optionalEnvVars.NODE_ENV === 'test',
} as const

export type Env = typeof env