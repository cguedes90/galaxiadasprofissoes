'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RecommendationsResult, ProfessionRecommendation, RecommendationFilters } from '@/types/recommendations'
import FavoriteButton from './FavoriteButton'
import ComparisonButton from './ComparisonButton'

interface RecommendationsPanelProps {
  isOpen: boolean
  onClose: () => void
  onProfessionClick?: (professionId: number) => void
}

export default function RecommendationsPanel({ 
  isOpen, 
  onClose, 
  onProfessionClick 
}: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<RecommendationsResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RecommendationFilters>({
    limit: 12
  })

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.salaryMin) params.append('salary_min', filters.salaryMin.toString())
      if (filters.salaryMax) params.append('salary_max', filters.salaryMax.toString())
      if (filters.maxEducationTime) params.append('max_education_time', filters.maxEducationTime.toString())
      if (filters.includeAreas?.length) params.append('include_areas', filters.includeAreas.join(','))
      if (filters.excludeAreas?.length) params.append('exclude_areas', filters.excludeAreas.join(','))
      if (filters.onlyTrending) params.append('only_trending', 'true')

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/recommendations?${params}`, { headers })
      const result = await response.json()

      if (result.success) {
        setRecommendations(result.data)
      } else {
        setError(result.message || 'Erro ao carregar recomendações')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Error fetching recommendations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations()
    }
  }, [isOpen, filters])

  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`
  }

  const getCategoryInfo = (category: ProfessionRecommendation['category']) => {
    switch (category) {
      case 'perfect_match':
        return { 
          label: 'Match Perfeito', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🎯'
        }
      case 'good_match':
        return { 
          label: 'Boa Opção', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '✨'
        }
      case 'trending':
        return { 
          label: 'Em Alta', 
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🔥'
        }
      default:
        return { 
          label: 'Explorar', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '🔍'
        }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 55) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Recomendações Personalizadas</h2>
              <p className="mt-2 opacity-90">
                Profissões selecionadas especialmente para você
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              />
              <span className="ml-3 text-gray-600">Gerando recomendações personalizadas...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <span className="text-red-500 text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-red-800 font-semibold">Erro ao carregar recomendações</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                  <button
                    onClick={fetchRecommendations}
                    className="mt-3 text-red-700 hover:text-red-800 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && !isLoading && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Resumo das Recomendações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {recommendations.summary.perfectMatches}
                    </div>
                    <div className="text-sm text-gray-600">Matches Perfeitos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {recommendations.summary.exploreOptions}
                    </div>
                    <div className="text-sm text-gray-600">Para Explorar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {recommendations.summary.trendingOptions}
                    </div>
                    <div className="text-sm text-gray-600">Em Alta</div>
                  </div>
                </div>
                
                {recommendations.summary.primaryReasons.length > 0 && (
                  <div>
                    <p className="text-sm text-purple-700 mb-2">
                      <strong>Principais critérios utilizados:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.summary.primaryReasons.map(reason => (
                        <span key={reason} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {recommendations.recommendations.map((recommendation, index) => {
                    const categoryInfo = getCategoryInfo(recommendation.category)
                    
                    return (
                      <motion.div
                        key={recommendation.profession.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <button
                              onClick={() => onProfessionClick?.(recommendation.profession.id)}
                              className="text-left hover:text-purple-600 transition-colors flex-1"
                            >
                              <h3 className="font-semibold text-gray-800 line-clamp-2">
                                {recommendation.profession.name}
                              </h3>
                            </button>
                            <div className={`ml-2 text-lg font-bold ${getScoreColor(recommendation.score)}`}>
                              {recommendation.score}%
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {recommendation.profession.area}
                            </span>
                            <div className={`px-2 py-1 text-xs border rounded-full ${categoryInfo.color}`}>
                              {categoryInfo.icon} {categoryInfo.label}
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          {/* Salary */}
                          <div className="text-sm">
                            <span className="text-gray-600">Salário: </span>
                            <span className="text-green-600 font-medium">
                              {formatSalary(recommendation.profession.salary_min, recommendation.profession.salary_max)}
                            </span>
                          </div>

                          {/* Formation Time */}
                          <div className="text-sm">
                            <span className="text-gray-600">Formação: </span>
                            <span className="text-blue-600 font-medium">
                              {recommendation.profession.formation_time}
                            </span>
                          </div>

                          {/* Reasons */}
                          <div className="space-y-1">
                            {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="text-xs text-gray-600 flex items-start">
                                <span className="text-purple-500 mr-1">•</span>
                                <span>{reason.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 pt-0 flex justify-between items-center">
                          <button
                            onClick={() => onProfessionClick?.(recommendation.profession.id)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Ver detalhes →
                          </button>
                          
                          <div className="flex gap-2">
                            <ComparisonButton profession={recommendation.profession} size="sm" />
                            <FavoriteButton profession={recommendation.profession} size="sm" />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}