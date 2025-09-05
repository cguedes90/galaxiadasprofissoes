'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VocationalResult, VocationalQuestion } from '@/types/vocational-test'
import { VOCATIONAL_TEST } from '@/data/vocational-questions'
import { VOCATIONAL_CATEGORIES } from '@/types/vocational-test'

interface VocationalTestProps {
  onClose: () => void
  onComplete: (result: VocationalResult) => void
}

export default function VocationalTest({ onClose, onComplete }: VocationalTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: string}>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [result, setResult] = useState<VocationalResult | null>(null)

  const test = VOCATIONAL_TEST
  const progress = (currentQuestion / test.questions.length) * 100

  const handleAnswer = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }))

    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateResult()
    }
  }

  const calculateResult = () => {
    const categoryScores: {[key: string]: number} = {
      R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
    }

    // Calcular pontuações por categoria com pesos melhorados
    test.questions.forEach((question, index) => {
      const selectedOption = answers[index]
      if (selectedOption) {
        const option = question.options.find(opt => opt.id === selectedOption)
        if (option) {
          option.categories.forEach(category => {
            categoryScores[category] += option.weight
          })
        }
      }
    })

    // Normalizar pontuações (0-100)
    const totalQuestions = test.questions.length
    const normalizedScores: {[key: string]: number} = {}
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      // Máximo possível: perguntas * peso máximo (3)
      const maxPossible = totalQuestions * 3
      normalizedScores[category] = Math.round((score / maxPossible) * 100)
    })

    // Encontrar top 3 categorias com base na pontuação normalizada
    const sortedCategories = Object.entries(normalizedScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    const topCategories = sortedCategories.map(([category]) => category)

    // Melhorar o sistema de matching de profissões
    const matchedProfessions: {
      profession: string
      compatibility: number
      reasons: string[]
    }[] = []
    
    // Definir profissões base compatíveis com cada categoria
    const categoryProfessions: {[key: string]: string[]} = {
      R: ['Engenheiro Civil', 'Engenheiro Elétrico', 'Arquiteto', 'Chef de Cozinha'],
      I: ['Cientista de Dados', 'Desenvolvedor Full Stack', 'Engenheiro de Software', 'Especialista em IA e Machine Learning', 'Analista de Dados', 'Químico', 'Biólogo'],
      A: ['Designer UX/UI', 'Designer Gráfico', 'Designer de Experiência em Realidade Virtual', 'Jornalista', 'Tradutor'],
      S: ['Médico Cardiologista', 'Psicólogo Clínico', 'Enfermeiro', 'Professor de Ensino Médio', 'Fisioterapeuta', 'Nutricionista', 'Dentista', 'Veterinário', 'Terapeuta Digital'],
      E: ['Advogado', 'Marketing Digital', 'Product Manager'],
      C: ['Contador', 'Farmacêutico', 'Biomédico']
    }
    
    // Calcular compatibilidade para cada categoria
    for (const [categoryKey, professions] of Object.entries(categoryProfessions)) {
      const categoryScore = normalizedScores[categoryKey]
      
      if (categoryScore > 25) { // Threshold mínimo mais baixo
        professions.forEach(profession => {
          const reasons = []
          let compatibility = categoryScore
          
          // Bonus para categorias principais
          if (topCategories.includes(categoryKey)) {
            const categoryName = VOCATIONAL_CATEGORIES[categoryKey as keyof typeof VOCATIONAL_CATEGORIES]?.name || categoryKey
            reasons.push(`Forte afinidade com perfil ${categoryName}`)
            compatibility += 10 // Bonus de 10%
          }
          
          // Bonus para combinações de categorias
          const topCategoryScores = topCategories.map(cat => normalizedScores[cat])
          if (topCategoryScores.length >= 2 && topCategoryScores[1] > 40) {
            reasons.push('Perfil equilibrado entre múltiplas áreas')
            compatibility += 5
          }
          
          // Ajustar compatibilidade baseado na distribuição de pontos
          const scoreVariance = Math.abs(categoryScore - (Object.values(normalizedScores).reduce((a, b) => a + b, 0) / 6))
          if (scoreVariance > 20) {
            reasons.push('Perfil bem definido para esta área')
            compatibility += 5
          }
          
          matchedProfessions.push({
            profession,
            compatibility: Math.min(compatibility, 100), // Cap at 100%
            reasons: reasons.length > 0 ? reasons : [`Boa afinidade com o perfil ${categoryKey}`]
          })
        })
      }
    }

    // Ordenar por compatibilidade e remover duplicatas
    const uniqueProfessions = matchedProfessions
      .reduce((acc, curr) => {
        const existing = acc.find(p => p.profession === curr.profession)
        if (!existing || existing.compatibility < curr.compatibility) {
          return [...acc.filter(p => p.profession !== curr.profession), curr]
        }
        return acc
      }, [] as typeof matchedProfessions)
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 10) // Top 10 profissões

    const finalResult: VocationalResult = {
      categories: normalizedScores,
      topCategories,
      matchedProfessions: uniqueProfessions
    }

    setResult(finalResult)
    setIsCompleted(true)
    onComplete(finalResult)
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  if (isCompleted && result) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Seus Resultados</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Perfil Vocacional */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Seu Perfil Vocacional</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.topCategories.map((categoryKey, index) => {
                  const category = VOCATIONAL_CATEGORIES[categoryKey as keyof typeof VOCATIONAL_CATEGORIES]
                  return (
                    <div
                      key={categoryKey}
                      className="p-4 rounded-lg border-2"
                      style={{ borderColor: category.color }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h4 className="font-semibold">{category.name}</h4>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Profissões Recomendadas */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Profissões Recomendadas para Você
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.matchedProfessions.map((match, index) => (
                  <div
                    key={match.profession}
                    className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{match.profession}</h4>
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                        {match.compatibility}% match
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600">
                      {match.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Profissões na Galáxia
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Refazer Teste
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{test.title}</h2>
              <p className="text-gray-600">Questão {currentQuestion + 1} de {test.questions.length}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {test.questions[currentQuestion].question}
              </h3>
              <div className="space-y-3">
                {test.questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-lg border hover:border-blue-200 transition-colors"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="text-sm text-gray-500">
              {test.estimatedTime} min estimados
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}