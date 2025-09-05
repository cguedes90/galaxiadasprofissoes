import { Profession } from './profession'

export interface ComparisonCriteria {
  salary: boolean
  education: boolean
  time: boolean
  activities: boolean
  certifications: boolean
  area: boolean
}

export interface ProfessionComparison {
  professions: Profession[]
  criteria: ComparisonCriteria
  createdAt: Date
}

export interface ComparisonMetric {
  profession: Profession
  score: number
  details: {
    salary_score: number
    education_score: number
    time_score: number
    market_score?: number
  }
}

export interface ComparisonResult {
  professions: Profession[]
  metrics: ComparisonMetric[]
  summary: {
    best_salary: Profession
    fastest_education: Profession
    most_activities: Profession
    recommendations: string[]
  }
}

export interface SavedComparison {
  id: string
  user_id?: string
  name: string
  professions: Profession[]
  criteria: ComparisonCriteria
  notes?: string
  created_at: Date
  updated_at: Date
}