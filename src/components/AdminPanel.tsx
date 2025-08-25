'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface GalaxyStats {
  currentTotal: number
  byArea: { area: string; count: number }[]
  availableToAdd: number
  emergingProfessions: { name: string; area: string; description: string }[]
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [stats, setStats] = useState<GalaxyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandingGalaxy, setExpandingGalaxy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/professions/suggest')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      setMessage('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  const expandGalaxy = async () => {
    try {
      setExpandingGalaxy(true)
      setMessage('Expandindo a galáxia... ✨')
      
      const response = await fetch('/api/professions/expand-galaxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto: true })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage(`🎉 ${result.totalAdded} nova(s) profissão(ões) adicionada(s)! Total: ${result.newTotalProfessions}`)
        await fetchStats() // Atualizar estatísticas
      } else {
        setMessage(`❌ Erro: ${result.message || 'Falha na expansão'}`)
      }
      
    } catch (error) {
      console.error('Erro na expansão:', error)
      setMessage('❌ Erro ao expandir galáxia')
    } finally {
      setExpandingGalaxy(false)
    }
  }

  const addSpecificProfession = async (profession: { name: string; area: string; description: string }) => {
    try {
      setLoading(true)
      setMessage(`Adicionando ${profession.name}...`)
      
      // Buscar detalhes completos da profissão
      const suggestResponse = await fetch('/api/professions/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10 })
      })
      
      const suggestData = await suggestResponse.json()
      const fullProfession = suggestData.suggestions?.find((p: any) => p.name === profession.name)
      
      if (!fullProfession) {
        setMessage('❌ Detalhes da profissão não encontrados')
        return
      }
      
      const response = await fetch('/api/professions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullProfession)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage(`✅ ${profession.name} adicionada com sucesso!`)
        await fetchStats()
      } else {
        setMessage(`❌ Erro: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Erro ao adicionar profissão:', error)
      setMessage('❌ Erro ao adicionar profissão')
    } finally {
      setLoading(false)
    }
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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🛠️ Administração da Galáxia</h2>
              <p className="text-purple-100 text-sm mt-1">
                Gerencie e expanda sua galáxia de profissões
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Message Display */}
          {message && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          {/* Stats Section */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Carregando estatísticas...</p>
            </div>
          ) : stats ? (
            <>
              {/* Current Stats */}
              <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Estatísticas Atuais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.currentTotal}</div>
                    <div className="text-sm text-gray-600">Profissões Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.byArea.length}</div>
                    <div className="text-sm text-gray-600">Áreas Diferentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.availableToAdd}</div>
                    <div className="text-sm text-gray-600">Disponíveis p/ Adicionar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round((stats.currentTotal / 50) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Meta de 50 Prof.</div>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">⚡ Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={expandGalaxy}
                    disabled={expandingGalaxy || stats.availableToAdd === 0}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    {expandingGalaxy ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Expandindo...
                      </span>
                    ) : (
                      '🌟 Expansão Automática (5 profissões)'
                    )}
                  </button>
                  
                  <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-lg font-semibold transition-colors"
                  >
                    🔄 Atualizar Estatísticas
                  </button>
                </div>
              </section>

              {/* Areas Distribution */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Distribuição por Área</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {stats.byArea.map((area, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-3 rounded-lg">
                      <div className="font-semibold text-gray-800">{area.area}</div>
                      <div className="text-2xl font-bold text-purple-600">{area.count}</div>
                      <div className="text-xs text-gray-500">profissões</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Available Professions */}
              {stats.emergingProfessions.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    🚀 Profissões Emergentes Disponíveis ({stats.emergingProfessions.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {stats.emergingProfessions.map((prof, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{prof.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{prof.description}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {prof.area}
                            </span>
                          </div>
                          <button
                            onClick={() => addSpecificProfession(prof)}
                            disabled={loading}
                            className="ml-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Erro ao carregar dados da galáxia
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 Dica: Use a expansão automática para adicionar várias profissões de uma vez
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}