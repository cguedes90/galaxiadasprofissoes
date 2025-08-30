export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  lastLogin: Date
  profile: UserProfile
  preferences: UserPreferences
  isActive: boolean
  emailVerified: boolean
}

export interface UserProfile {
  // Informações Básicas
  fullName: string
  dateOfBirth: Date
  gender?: 'masculine' | 'feminine' | 'other' | 'prefer_not_to_say'
  location: {
    city?: string
    state?: string
    country: string
  }
  
  // Informações Educacionais
  education: EducationInfo
  
  // Informações Profissionais
  professional: ProfessionalInfo
  
  // Interesses e Objetivos
  interests: string[]
  careerGoals: CareerGoal[]
  
  // Informações Opcionais
  bio?: string
  socialLinks?: SocialLinks
  phone?: string
  
  // Dados para Personalização
  personalityTraits?: PersonalityTraits
  skills?: Skill[]
  languages?: Language[]
}

export interface EducationInfo {
  currentLevel: 'ensino_fundamental' | 'ensino_medio' | 'ensino_tecnico' | 'ensino_superior' | 'pos_graduacao' | 'mestrado' | 'doutorado'
  status: 'estudando' | 'concluido' | 'interrompido' | 'pretendo_cursar'
  institution?: string
  course?: string
  year?: number
  expectedCompletion?: Date
  grades?: number // Média geral (0-10)
  favoriteSubjects?: string[]
}

export interface ProfessionalInfo {
  status: 'estudante' | 'empregado' | 'desempregado' | 'freelancer' | 'empreendedor' | 'aposentado' | 'outro'
  currentJob?: {
    title: string
    company: string
    industry: string
    startDate: Date
    salary?: {
      min: number
      max: number
      currency: string
    }
  }
  workExperience: WorkExperience[]
  dreamJob?: string
  careerChangeInterest: boolean
}

export interface WorkExperience {
  id: string
  jobTitle: string
  company: string
  industry: string
  startDate: Date
  endDate?: Date
  description?: string
  skills: string[]
  isCurrent: boolean
}

export interface CareerGoal {
  id: string
  title: string
  description: string
  timeframe: 'short_term' | 'medium_term' | 'long_term' // 1 ano, 2-5 anos, 5+ anos
  priority: 'low' | 'medium' | 'high'
  category: 'education' | 'job_change' | 'skill_development' | 'salary_increase' | 'other'
  progress: number // 0-100
  createdAt: Date
}

export interface SocialLinks {
  linkedin?: string
  github?: string
  portfolio?: string
  instagram?: string
  twitter?: string
  other?: { name: string; url: string }[]
}

export interface PersonalityTraits {
  // Baseado no Big Five
  openness: number // 1-10 (Abertura para experiências)
  conscientiousness: number // 1-10 (Conscienciosidade)
  extraversion: number // 1-10 (Extroversão)
  agreeableness: number // 1-10 (Amabilidade)
  neuroticism: number // 1-10 (Neuroticismo)
  
  // Características específicas
  creativity: number // 1-10
  leadership: number // 1-10
  teamwork: number // 1-10
  communication: number // 1-10
  problemSolving: number // 1-10
}

export interface Skill {
  id: string
  name: string
  category: 'technical' | 'soft' | 'language' | 'creative' | 'analytical' | 'other'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  addedAt: Date
}

export interface Language {
  code: string // 'pt-BR', 'en-US', etc.
  name: string
  level: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native'
  certified: boolean
}

export interface UserPreferences {
  // Preferências de Interface
  theme: 'light' | 'dark' | 'auto'
  language: string
  
  // Preferências de Notificação
  notifications: {
    email: boolean
    push: boolean
    achievements: boolean
    journeys: boolean
    recommendations: boolean
    newsletter: boolean
  }
  
  // Preferências de Privacidade
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    shareProgress: boolean
    shareAchievements: boolean
    allowRecommendations: boolean
    dataCollection: boolean
  }
  
  // Preferências de Recomendação
  recommendationFilters: {
    salaryRange?: { min: number; max: number }
    educationLevel?: string[]
    workMode?: ('remote' | 'hybrid' | 'presential')[]
    regions?: string[]
    industries?: string[]
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  isLoggedIn: boolean
  token?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  name: string
  dateOfBirth: Date | null
  education?: {
    level: EducationInfo['currentLevel']
    status: EducationInfo['status']
  }
  agreeTerms: boolean
  agreeNewsletter?: boolean
}