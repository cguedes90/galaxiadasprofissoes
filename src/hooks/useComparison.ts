'use client'

import { useState, useCallback } from 'react'
import { Profession } from '@/types/profession'
import { ComparisonCriteria, ComparisonResult, ComparisonMetric } from '@/types/comparison'

interface UseComparisonReturn {
  comparisons: Profession[]
  isComparing: boolean
  addToComparison: (profession: Profession) => void
  removeFromComparison: (professionId: number) => void
  clearComparison: () => void
  isInComparison: (professionId: number) => boolean
  compareResults: ComparisonResult | null
  performComparison: (criteria: ComparisonCriteria) => ComparisonResult
  canCompare: boolean
}

export function useComparison(): UseComparisonReturn {
  const [comparisons, setComparisons] = useState<Profession[]>([])
  const [compareResults, setCompareResults] = useState<ComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  const addToComparison = useCallback((profession: Profession) => {
    setComparisons(prev => {
      // Limite máximo de 4 profissões para comparação
      if (prev.length >= 4) {
        return prev
      }
      
      // Não adicionar duplicatas
      if (prev.some(p => p.id === profession.id)) {
        return prev
      }
      
      return [...prev, profession]
    })
  }, [])

  const removeFromComparison = useCallback((professionId: number) => {
    setComparisons(prev => prev.filter(p => p.id !== professionId))
    // Limpar resultados se remover uma profissão
    if (compareResults) {
      setCompareResults(null)
    }
  }, [compareResults])

  const clearComparison = useCallback(() => {
    setComparisons([])
    setCompareResults(null)
  }, [])

  const isInComparison = useCallback((professionId: number): boolean => {
    return comparisons.some(p => p.id === professionId)
  }, [comparisons])

  const calculateEducationScore = (education: string, time: string): number => {
    // Score baseado no tempo de formação (menor tempo = maior score)
    const timeMatch = time.match(/(\d+)/)
    const years = timeMatch ? parseInt(timeMatch[1]) : 5
    
    let score = Math.max(0, 100 - (years * 15)) // Cada ano reduz 15 pontos
    
    // Ajustes baseados no tipo de educação
    if (education.includes('Técnico')) score += 20
    if (education.includes('Especialização')) score -= 10
    if (education.includes('Mestrado') || education.includes('Doutorado')) score -= 20
    
    return Math.min(Math.max(score, 0), 100)
  }

  const calculateSalaryScore = (minSalary: number, maxSalary: number): number => {
    // Score baseado na média salarial
    const avgSalary = (minSalary + maxSalary) / 2
    
    // Normalização: R$ 1.500 = 0%, R$ 25.000 = 100%
    const normalizedScore = ((avgSalary - 1500) / (25000 - 1500)) * 100
    
    return Math.min(Math.max(normalizedScore, 0), 100)
  }

  const calculateTimeScore = (time: string): number => {
    const timeMatch = time.match(/(\d+)/)
    const years = timeMatch ? parseInt(timeMatch[1]) : 5
    
    // Tempo menor = score maior
    return Math.max(0, 100 - (years * 20))
  }

  const performComparison = useCallback((criteria: ComparisonCriteria): ComparisonResult => {
    setIsComparing(true)

    const metrics: ComparisonMetric[] = comparisons.map(profession => {
      const salaryScore = calculateSalaryScore(profession.salary_min, profession.salary_max)
      const educationScore = calculateEducationScore(profession.required_education, profession.formation_time)
      const timeScore = calculateTimeScore(profession.formation_time)
      
      // Calcular score geral baseado nos critérios selecionados
      let totalScore = 0
      let criteriaCount = 0
      
      if (criteria.salary) {
        totalScore += salaryScore
        criteriaCount++
      }
      if (criteria.education || criteria.time) {
        totalScore += educationScore
        criteriaCount++
      }
      
      const finalScore = criteriaCount > 0 ? totalScore / criteriaCount : 50

      return {
        profession,
        score: Math.round(finalScore),
        details: {
          salary_score: Math.round(salaryScore),
          education_score: Math.round(educationScore),
          time_score: Math.round(timeScore)
        }
      }
    })

    // Ordenar por score
    metrics.sort((a, b) => b.score - a.score)

    // Calcular summary
    const bestSalary = comparisons.reduce((best, current) => 
      (current.salary_max > best.salary_max) ? current : best
    )
    
    const fastestEducation = comparisons.reduce((fastest, current) => {
      const fastestYears = fastest.formation_time.match(/(\d+)/)?.[1]
      const currentYears = current.formation_time.match(/(\d+)/)?.[1]
      return (currentYears && (!fastestYears || parseInt(currentYears) < parseInt(fastestYears))) ? current : fastest
    })
    
    const mostActivities = comparisons.reduce((most, current) => 
      (current.main_activities.length > most.main_activities.length) ? current : most
    )

    const recommendations: string[] = []
    
    if (criteria.salary) {
      recommendations.push(`💰 ${bestSalary.name} oferece o melhor salário (até R$ ${bestSalary.salary_max.toLocaleString()})`)
    }
    
    if (criteria.time) {
      recommendations.push(`⏰ ${fastestEducation.name} tem a formação mais rápida (${fastestEducation.formation_time})`)
    }
    
    if (criteria.activities) {
      recommendations.push(`🎯 ${mostActivities.name} oferece mais diversidade de atividades (${mostActivities.main_activities.length} atividades principais)`)
    }

    const result: ComparisonResult = {
      professions: comparisons,
      metrics,
      summary: {
        best_salary: bestSalary,
        fastest_education: fastestEducation,
        most_activities: mostActivities,
        recommendations
      }
    }

    setCompareResults(result)
    setIsComparing(false)
    
    return result
  }, [comparisons])

  const canCompare = comparisons.length >= 2

  return {
    comparisons,
    isComparing,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    compareResults,
    performComparison,
    canCompare
  }
}