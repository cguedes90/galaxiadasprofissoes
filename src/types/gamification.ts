export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'exploration' | 'knowledge' | 'completion' | 'social'
  condition: {
    type: 'profession_viewed' | 'test_completed' | 'areas_explored' | 'wishlist_size'
    target: number
    current?: number
  }
  reward: {
    type: 'badge' | 'title' | 'unlock'
    value: string
  }
  unlocked: boolean
  unlockedAt?: Date
}

export interface UserProgress {
  userId: string
  level: number
  experience: number
  professionsViewed: string[]
  areasExplored: string[]
  testsCompleted: number
  achievements: Achievement[]
  currentTitle?: string
  createdAt: Date
  lastActive: Date
}

export interface Journey {
  id: string
  title: string
  description: string
  theme: string
  color: string
  icon: string
  steps: JourneyStep[]
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
}

export interface JourneyStep {
  id: string
  title: string
  description: string
  type: 'view_profession' | 'explore_area' | 'complete_quiz' | 'compare_professions'
  target: string[] // IDs ou nomes das profissões/áreas
  completed: boolean
  reward?: {
    experience: number
    achievement?: string
  }
}

export interface Wishlist {
  userId: string
  professions: WishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  professionName: string
  addedAt: Date
  notes?: string
  priority: 'low' | 'medium' | 'high'
}

export interface Comparison {
  id: string
  professions: string[] // Array of profession names
  criteria: ComparisonCriteria[]
  createdAt: Date
  createdBy: string
}

export interface ComparisonCriteria {
  name: string
  values: { [professionName: string]: string | number }
  type: 'salary' | 'education' | 'time' | 'difficulty' | 'demand'
}