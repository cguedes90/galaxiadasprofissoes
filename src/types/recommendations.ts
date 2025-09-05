import { Profession } from './profession'
import { VocationalResult } from './vocational-test'
import { UserFavorite } from './favorites'

export interface RecommendationContext {
  userId?: string
  vocationalResult?: VocationalResult
  favorites?: UserFavorite[]
  viewedProfessions?: string[]
  areasExplored?: string[]
  age?: number
  educationLevel?: string
  location?: string
}

export interface RecommendationReason {
  type: 'vocational' | 'behavioral' | 'trending' | 'similar_users' | 'area_affinity'
  description: string
  confidence: number // 0-100
}

export interface ProfessionRecommendation {
  profession: Profession
  score: number // 0-100
  reasons: RecommendationReason[]
  category: 'perfect_match' | 'good_match' | 'explore' | 'trending'
}

export interface RecommendationsResult {
  recommendations: ProfessionRecommendation[]
  context: RecommendationContext
  generatedAt: Date
  summary: {
    totalRecommendations: number
    perfectMatches: number
    exploreOptions: number
    trendingOptions: number
    primaryReasons: string[]
  }
}

export interface RecommendationFilters {
  salaryMin?: number
  salaryMax?: number
  maxEducationTime?: number
  excludeAreas?: string[]
  includeAreas?: string[]
  onlyTrending?: boolean
  limit?: number
}