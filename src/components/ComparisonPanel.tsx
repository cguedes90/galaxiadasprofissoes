'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComparison } from '@/hooks/useComparison'
import { ComparisonCriteria } from '@/types/comparison'
import ComparisonButton from './ComparisonButton'

interface ComparisonPanelProps {
  isOpen: boolean
  onClose: () => void
  onProfessionClick?: (professionId: number) => void
}

export default function ComparisonPanel({ 
  isOpen, 
  onClose, 
  onProfessionClick 
}: ComparisonPanelProps) {
  const { 
    comparisons, 
    compareResults, 
    performComparison, 
    clearComparison, 
    removeFromComparison,
    canCompare,
    isComparing
  } = useComparison()

  const [criteria, setCriteria] = useState<ComparisonCriteria>({
    salary: true,
    education: true,
    time: true,
    activities: true,
    certifications: false,
    area: false
  })

  const [showResults, setShowResults] = useState(false)

  const handleCompare = () => {
    if (!canCompare) return
    
    performComparison(criteria)
    setShowResults(true)
  }

  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Comparação de Profissões</h2>
              <p className="mt-2 opacity-90">
                {comparisons.length === 0 ? 'Adicione profissões para comparar' : 
                 `${comparisons.length} profissão${comparisons.length > 1 ? 'ões' : ''} selecionada${comparisons.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex gap-2">
              {comparisons.length > 0 && (
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  Limpar Tudo
                </button>
              )}
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
          {/* Empty State */}
          {comparisons.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                ⚖️
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhuma profissão para comparar
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Navegue pela galáxia e use o botão de comparação nas profissões que te interessam!
              </p>
            </div>
          )}

          {/* Comparison Setup */}
          {comparisons.length > 0 && !showResults && (
            <div className="space-y-6">
              {/* Selected Professions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Profissões Selecionadas ({comparisons.length}/4)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {comparisons.map(profession => (
                    <div key={profession.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{profession.name}</h4>
                        <button
                          onClick={() => removeFromComparison(profession.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{profession.area}</p>
                      <p className="text-xs text-green-600">
                        {formatSalary(profession.salary_min, profession.salary_max)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Criteria */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Critérios de Comparação
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    salary: 'Salário',
                    education: 'Educação',
                    time: 'Tempo de Formação',
                    activities: 'Atividades',
                    certifications: 'Certificações',
                    area: 'Área de Atuação'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={criteria[key as keyof ComparisonCriteria]}
                        onChange={(e) => setCriteria(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Compare Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCompare}
                  disabled={!canCompare || isComparing}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isComparing ? 'Comparando...' : `Comparar ${comparisons.length} Profissões`}
                </button>
              </div>
            </div>
          )}

          {/* Comparison Results */}
          {showResults && compareResults && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setShowResults(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar para critérios
              </button>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Resumo da Comparação</h3>
                <div className="space-y-2">
                  {compareResults.summary.recommendations.map((rec, index) => (
                    <div key={index} className="text-blue-700 text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Comparison */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparação Detalhada</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left font-semibold text-gray-800">Profissão</th>
                        <th className="p-4 text-center font-semibold text-gray-800">Score Geral</th>
                        {criteria.salary && <th className="p-4 text-center font-semibold text-gray-800">Salário</th>}
                        {criteria.education && <th className="p-4 text-center font-semibold text-gray-800">Educação</th>}
                        {criteria.time && <th className="p-4 text-center font-semibold text-gray-800">Tempo</th>}
                        {criteria.activities && <th className="p-4 text-center font-semibold text-gray-800">Atividades</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {compareResults.metrics.map((metric, index) => (
                        <tr key={metric.profession.id} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <button
                                onClick={() => onProfessionClick?.(metric.profession.id)}
                                className="font-semibold text-blue-600 hover:text-blue-700"
                              >
                                {metric.profession.name}
                              </button>
                              <div className="text-sm text-gray-600">{metric.profession.area}</div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(metric.score)}`}>
                              {metric.score}%
                            </span>
                          </td>
                          {criteria.salary && (
                            <td className="p-4 text-center">
                              <div className="text-sm">
                                {formatSalary(metric.profession.salary_min, metric.profession.salary_max)}
                              </div>
                              <span className={`text-xs px-1 py-0.5 rounded ${getScoreColor(metric.details.salary_score)}`}>
                                {metric.details.salary_score}%
                              </span>
                            </td>
                          )}
                          {criteria.education && (
                            <td className="p-4 text-center">
                              <div className="text-sm">{metric.profession.formation_time}</div>
                              <span className={`text-xs px-1 py-0.5 rounded ${getScoreColor(metric.details.education_score)}`}>
                                {metric.details.education_score}%
                              </span>
                            </td>
                          )}
                          {criteria.time && (
                            <td className="p-4 text-center">
                              <span className={`text-xs px-1 py-0.5 rounded ${getScoreColor(metric.details.time_score)}`}>
                                {metric.details.time_score}%
                              </span>
                            </td>
                          )}
                          {criteria.activities && (
                            <td className="p-4 text-center">
                              <span className="text-sm font-medium">
                                {metric.profession.main_activities.length}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}