'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Profession } from '@/types/profession'
import { VocationalResult } from '@/types/vocational-test'
import { LoginCredentials, RegisterData, AuthUser } from '@/types/user'
import ProfessionModal from './ProfessionModal'
import SearchBar from './SearchBar'
import VocationalTest from './VocationalTest'
import GamificationPanel from './GamificationPanel'
import AuthModal from './AuthModal'
import AdminPanel from './AdminPanel'
import FreePlanLimitModal from './FreePlanLimitModal'
import { fallbackProfessions } from '@/data/fallback-professions'
import { useGamification } from '@/hooks/useGamification'
import { useFreePlanLimit } from '@/hooks/useFreePlanLimit'

export default function Galaxy() {
  const [professions, setProfessions] = useState<Profession[]>([])
  const [totalProfessions, setTotalProfessions] = useState<number>(0)
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [showVocationalTest, setShowVocationalTest] = useState(false)
  const [vocationalResult, setVocationalResult] = useState<VocationalResult | null>(null)
  const [showGamificationPanel, setShowGamificationPanel] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Gamificação
  const {
    userProgress,
    newAchievements,
    trackProfessionViewed,
    trackAreaExplored,
    trackTestCompleted,
    clearNewAchievements
  } = useGamification()

  // Sistema de limite do plano gratuito
  const {
    remainingViews,
    isBlocked,
    timeUntilReset,
    showLimitModal,
    setShowLimitModal,
    canViewProfession,
    markProfessionViewed,
    dailyLimit
  } = useFreePlanLimit()

  const fetchProfessions = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedArea) params.append('area', selectedArea)
      
      // Para a galáxia, queremos mostrar todas as profissões, não apenas uma página
      params.append('limit', '100') // Buscar até 100 profissões para mostrar todas na galáxia
      const response = await fetch(`/api/professions?${params}`)
      console.log('API Response status:', response.status)
      const result = await response.json()
      console.log('API Response data:', result)
      
      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ Carregadas ${result.data.length} profissões`)
        console.log('📊 Estrutura completa da resposta:', result)
        setProfessions(result.data)
        // Pega o total do meta.pagination ou usa o tamanho do array como fallback
        let totalFromAPI = 0
        if (result.meta && result.meta.pagination && result.meta.pagination.total) {
          totalFromAPI = result.meta.pagination.total
        } else {
          totalFromAPI = result.data.length
        }
        console.log(`🔢 Total de profissões: ${totalFromAPI}`)
        console.log('🔍 Meta object:', result.meta)
        console.log('🔍 Pagination object:', result.meta?.pagination)
        setTotalProfessions(Number(totalFromAPI))
      } else {
        console.error('❌ Resposta da API inválida:', result)
        console.log('🔄 Usando profissões de fallback')
        setProfessions(fallbackProfessions)
        setTotalProfessions(fallbackProfessions.length)
      }
    } catch (error) {
      console.error('Falha ao buscar profissões:', error)
      console.log('🔄 Usando profissões de fallback')
      setProfessions(fallbackProfessions as Profession[])
      setTotalProfessions(fallbackProfessions.length)
    }
  }

  useEffect(() => {
    fetchProfessions()
  }, [searchQuery, selectedArea])

  // Check for existing auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('currentUser')
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  // Authentication functions - simplified and robust
  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
          rememberMe: false
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Email ou senha incorretos')
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro no login')
      }

      // Store auth data
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        setCurrentUser(data.user)
      }
      
      console.log('Login realizado com sucesso!')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const handleRegister = async (data: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          dateOfBirth: data.dateOfBirth,
          agreeTerms: data.agreeTerms
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no cadastro')
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro no cadastro')
      }

      // Store auth data
      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }
      if (result.user) {
        localStorage.setItem('currentUser', JSON.stringify(result.user))
        setCurrentUser(result.user)
      }
      
      console.log('Cadastro realizado com sucesso!')
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    console.log('Logout realizado com sucesso!')
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    
    // Não iniciar drag se clicar em uma estrela ou elemento de interface
    if (target.hasAttribute('data-star') || 
        target.closest('[data-star]') ||
        target.closest('input') || 
        target.closest('select') || 
        target.closest('button')) {
      return
    }

    setIsDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.max(0.3, Math.min(2.5, transform.scale + delta))
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }))
  }

  const handleProfessionClick = (profession: Profession) => {
    // Verificar se pode visualizar a profissão (plano gratuito)
    if (!canViewProfession(profession.name)) {
      setShowLimitModal(true)
      return
    }

    // Marcar como visualizada
    if (markProfessionViewed(profession.name)) {
      setSelectedProfession(profession)
      // Track para gamificação
      trackProfessionViewed(profession.name)
      trackAreaExplored(profession.area)
    }
  }

  const handleVocationalTestComplete = (result: VocationalResult) => {
    setVocationalResult(result)
    setShowVocationalTest(false)
    // Track teste completado
    trackTestCompleted()
  }

  const handleRelatedProfessionClick = async (professionName: string) => {
    // Verificar limite do plano gratuito
    if (!canViewProfession(professionName)) {
      setShowLimitModal(true)
      return
    }

    // Buscar a profissão relacionada na lista atual
    const relatedProfession = professions.find(p => p.name === professionName)
    
    if (relatedProfession) {
      // Se encontrou na lista atual, mostrar o modal
      if (markProfessionViewed(relatedProfession.name)) {
        setSelectedProfession(relatedProfession)
        // Track para gamificação
        trackProfessionViewed(relatedProfession.name)
        trackAreaExplored(relatedProfession.area)
      }
    } else {
      // Se não encontrou, buscar na API (talvez a profissão não esteja carregada por filtros)
      try {
        const response = await fetch(`/api/professions?search=${encodeURIComponent(professionName)}`)
        const data = await response.json()
        const foundProfession = data.find((p: Profession) => p.name === professionName)
        
        if (foundProfession) {
          if (markProfessionViewed(foundProfession.name)) {
            setSelectedProfession(foundProfession)
            // Track para gamificação
            trackProfessionViewed(foundProfession.name)
            trackAreaExplored(foundProfession.area)
          }
        } else {
          console.warn(`Profissão "${professionName}" não encontrada`)
        }
      } catch (error) {
        console.error('Erro ao buscar profissão relacionada:', error)
      }
    }
  }

  const isProfessionHighlighted = (professionName: string): boolean => {
    if (!vocationalResult) return false
    return vocationalResult.matchedProfessions.some(match => match.profession === professionName)
  }

  const getProfessionCompatibility = (professionName: string): number => {
    if (!vocationalResult) return 0
    const match = vocationalResult.matchedProfessions.find(match => match.profession === professionName)
    return match ? match.compatibility : 0
  }

  const areas = Array.from(new Set(professions.map(p => p.area)))

  // Filter professions based on search query and selected area
  const filteredProfessions = professions.filter(profession => {
    const matchesSearch = !searchQuery || 
      profession.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profession.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profession.area.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesArea = !selectedArea || profession.area === selectedArea
    
    return matchesSearch && matchesArea
  })

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        areas={areas}
      />

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2 min-w-[200px]">
        {/* Authentication Row */}
        <div className="flex justify-end">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md flex items-center gap-2">
                <span>👤 {currentUser.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1.5 rounded-full text-xs transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              👤 Entrar
            </button>
          )}
        </div>

        {/* Status Row */}
        <div className="flex flex-col items-end gap-2">
          {/* User Progress */}
          {userProgress && (
            <div 
              onClick={() => setShowGamificationPanel(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span>⭐ Nv.{Math.floor(userProgress.experience / 100) + 1}</span>
              <span className="text-xs bg-white text-orange-600 px-1.5 py-0.5 rounded-full">
                {userProgress.experience}
              </span>
            </div>
          )}

          {/* Free Plan Indicator */}
          {!currentUser && (
            <button
              onClick={() => setShowLimitModal(true)}
              className={`${
                remainingViews === 0 ? 
                'bg-red-500 hover:bg-red-600' : 
                'bg-green-500 hover:bg-green-600'
              } text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300`}
            >
              🆓 {remainingViews}/{dailyLimit}
            </button>
          )}
        </div>
        
        {/* Action Buttons Row */}
        <div className="flex flex-wrap justify-end gap-1.5 max-w-[240px]">
          {/* Vocational Test Button */}
          <button
            onClick={() => setShowVocationalTest(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1"
          >
            🧠 Teste
            {vocationalResult && (
              <span className="bg-white text-purple-600 text-xs px-1 py-0.5 rounded-full">
                ✓
              </span>
            )}
          </button>

          {/* Gamification Button */}
          <button
            onClick={() => setShowGamificationPanel(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1"
          >
            🎮 Jornadas
            {newAchievements.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full animate-pulse">
                {newAchievements.length}
              </span>
            )}
          </button>

          {/* Admin Panel Button */}
          {currentUser && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1"
            >
              🛠️ Admin
            </button>
          )}
        </div>
      </div>

      {/* Galaxy Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="relative w-full h-full origin-center"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* Background Stars */}
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={`bg-star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 200}%`,
                top: `${Math.random() * 200}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite alternate`
              }}
            />
          ))}

          {/* Profession Stars */}
          {filteredProfessions.map((profession) => {
            const isHighlighted = isProfessionHighlighted(profession.name)
            const compatibility = getProfessionCompatibility(profession.name)
            
            return (
              <div
                key={profession.id}
                data-star
                className={`absolute cursor-pointer rounded-full transition-all duration-500 hover:scale-125 ${
                  isHighlighted ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: profession.icon_color,
                  width: isHighlighted ? '28px' : '20px',
                  height: isHighlighted ? '28px' : '20px',
                  left: `calc(50% + ${profession.x_position}px)`,
                  top: `calc(50% + ${profession.y_position}px)`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: isHighlighted 
                    ? `0 0 30px ${profession.icon_color}, 0 0 60px ${profession.icon_color}80`
                    : `0 0 15px ${profession.icon_color}40`,
                  border: isHighlighted ? `3px solid ${profession.icon_color}` : 'none',
                  zIndex: isHighlighted ? 10 : 5
                }}
                onClick={() => handleProfessionClick(profession)}
              >
                {/* Compatibility Badge */}
                {isHighlighted && compatibility > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                    {compatibility}%
                  </div>
                )}
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                  {profession.name}
                  {isHighlighted && (
                    <div className="text-green-300 font-semibold">
                      ✨ Recomendado para você!
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profession Modal */}
      <AnimatePresence>
        {selectedProfession && (
          <ProfessionModal
            profession={selectedProfession}
            onClose={() => setSelectedProfession(null)}
            onRelatedProfessionClick={handleRelatedProfessionClick}
          />
        )}
      </AnimatePresence>

      {/* Vocational Test Modal */}
      <AnimatePresence>
        {showVocationalTest && (
          <VocationalTest
            onClose={() => setShowVocationalTest(false)}
            onComplete={handleVocationalTestComplete}
          />
        )}
      </AnimatePresence>

      {/* Gamification Panel */}
      <AnimatePresence>
        {showGamificationPanel && (
          <GamificationPanel
            isOpen={showGamificationPanel}
            onClose={() => setShowGamificationPanel(false)}
            userProgress={userProgress}
            onStartJourney={(journeyId) => {
              console.log('Iniciando jornada:', journeyId)
              setShowGamificationPanel(false)
              // TODO: Implementar lógica de jornadas
            }}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => {
              setShowAdminPanel(false)
              // Refresh professions after admin changes
              fetchProfessions()
            }}
          />
        )}
      </AnimatePresence>

      {/* Free Plan Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <FreePlanLimitModal
            isOpen={showLimitModal}
            onClose={() => setShowLimitModal(false)}
            remainingViews={remainingViews}
            timeUntilReset={timeUntilReset}
            isBlocked={isBlocked}
            dailyLimit={dailyLimit}
          />
        )}
      </AnimatePresence>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-xl max-w-sm"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{ bottom: `${(index * 120) + 16}px` }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <div className="font-bold">🏆 Conquista Desbloqueada!</div>
                <div className="text-sm">{achievement.title}</div>
              </div>
              <button
                onClick={clearNewAchievements}
                className="ml-auto text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded z-10">
        <div>🖱️ Arraste para navegar</div>
        <div>🔍 Use a roda do mouse para zoom</div>
        <div>⭐ Clique nas estrelas para ver detalhes</div>
        <div>🔗 Clique nas profissões relacionadas para explorá-las</div>
        <div>🧠 Faça o teste vocacional para recomendações personalizadas</div>
        {!currentUser && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div>🆓 <strong>Plano Gratuito:</strong> {remainingViews}/{dailyLimit} visualizações restantes</div>
            {isBlocked && timeUntilReset && (
              <div className="text-yellow-300">⏰ Reset em: {timeUntilReset}</div>
            )}
          </div>
        )}
      </div>

      {/* Galaxy Stats in the bottom right */}
      <div className="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded z-10 space-y-2">
        {/* Total Professions Counter */}
        <div className="text-center border-b border-gray-600 pb-2">
          <div className="text-xs text-gray-300">
            🌌 Galáxia com {totalProfessions || 0} profissões em constante expansão...
          </div>
        </div>
        
        {/* Vocational Result Summary */}
        {vocationalResult && (
          <div>
            <div className="font-semibold mb-2">✨ Profissões destacadas para você:</div>
            <div className="text-xs">
              {vocationalResult.matchedProfessions.slice(0, 3).map(match => (
                <div key={match.profession} className="text-green-300">
                  • {match.profession} ({match.compatibility}%)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}