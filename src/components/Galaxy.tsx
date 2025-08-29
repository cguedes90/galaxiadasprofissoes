'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Profession } from '@/types/profession'
import ProfessionModal from './ProfessionModal'
import SearchBar from './SearchBar'
import { fallbackProfessions } from '@/data/fallback-professions'

export default function Galaxy() {
  const [professions, setProfessions] = useState<Profession[]>([])
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPanPoint = useRef({ x: 0, y: 0 })

  const fetchProfessions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedArea) params.append('area', selectedArea)
      
      const response = await fetch(`/api/professions?${params}`)
      console.log('API Response status:', response.status)
      const result = await response.json()
      console.log('API Response data:', result)
      
      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ Carregadas ${result.data.length} profissões`)
        setProfessions(result.data)
      } else {
        console.error('❌ Resposta da API inválida:', result)
        console.log('🔄 Usando profissões de fallback')
        setProfessions(fallbackProfessions)
      }
    } catch (error) {
      console.error('Falha ao buscar profissões:', error)
      console.log('🔄 Usando profissões de fallback')
      setProfessions(fallbackProfessions as Profession[])
    }
  }, [searchQuery, selectedArea])

  useEffect(() => {
    fetchProfessions()
  }, [fetchProfessions])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Permitir arrastar em qualquer lugar, exceto nos elementos interativos
    const target = e.target as HTMLElement
    
    // Verificar se é uma estrela, input, select, button ou está dentro deles
    if (target.classList.contains('star') || 
        target.closest('input') || 
        target.closest('select') || 
        target.closest('button') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON') {
      return
    }
    
    setIsDragging(true)
    lastPanPoint.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - lastPanPoint.current.x
    const deltaY = e.clientY - lastPanPoint.current.y
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    lastPanPoint.current = { x: e.clientX, y: e.clientY }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const delta = e.deltaY * -0.001
    const newScale = Math.min(Math.max(scale + delta, 0.3), 2.5)
    
    // Aplicar zoom centrado no mouse
    const scaleDiff = newScale - scale
    const newX = position.x - (mouseX - rect.width / 2) * scaleDiff
    const newY = position.y - (mouseY - rect.height / 2) * scaleDiff
    
    setScale(newScale)
    setPosition({ x: newX, y: newY })
  }

  // Adicionar event listeners globais para mouse move e up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'auto'
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleProfessionClick = (profession: Profession) => {
    setSelectedProfession(profession)
  }

  const handleRelatedProfessionClick = (professionName: string) => {
    // Find profession by name in the current professions list
    const foundProfession = professions.find(p => 
      p.name.toLowerCase().includes(professionName.toLowerCase()) ||
      professionName.toLowerCase().includes(p.name.toLowerCase())
    )
    
    if (foundProfession) {
      setSelectedProfession(foundProfession)
    } else {
      // If not found, show an alert or could trigger a search
      console.log(`Profissão "${professionName}" não encontrada na lista atual`)
    }
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

      {/* Galaxy Container */}
      <div
        ref={containerRef}
        className="galaxy-container"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{
            x: position.x,
            y: position.y,
            scale: scale
          }}
          transition={{ 
            type: isDragging ? "tween" : "spring", 
            damping: 30, 
            stiffness: 200,
            duration: isDragging ? 0 : 0.3
          }}
        >
          {/* Background Stars */}
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={`bg-star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 200}%`,
                top: `${Math.random() * 200}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}

          {/* Profession Stars */}
          <AnimatePresence>
            {filteredProfessions.map((profession) => (
              <motion.div
                key={profession.id}
                className="star"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ 
                  scale: 1.3,
                  boxShadow: `0 0 30px ${profession.icon_color}`
                }}
                onClick={() => handleProfessionClick(profession)}
                style={{
                  backgroundColor: profession.icon_color,
                  width: '16px',
                  height: '16px',
                  left: `calc(50% + ${profession.x_position}px)`,
                  top: `calc(50% + ${profession.y_position}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {profession.name}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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

      {/* Galaxy Stats & Legend */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">
            {filteredProfessions.length} profissões em nossa galáxia
          </span>
        </div>
        <div className="text-xs text-gray-300">
          🌌 Galáxia em constante crescimento...
        </div>
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div>🖱️ Arraste para navegar</div>
          <div>🔍 Use a roda do mouse para zoom</div>
          <div>⭐ Clique nas estrelas para ver detalhes</div>
        </div>
      </div>

      {/* Areas Legend */}
      {filteredProfessions.length > 0 && (
        <div className="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded max-w-xs">
          <div className="font-semibold mb-2 flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            Áreas Disponíveis
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Array.from(new Set(filteredProfessions.map(p => p.area)))
              .sort()
              .map(area => {
                const count = filteredProfessions.filter(p => p.area === area).length
                const areaColor = filteredProfessions.find(p => p.area === area)?.icon_color || '#ffffff'
                return (
                  <div key={area} className="flex items-center space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: areaColor }}
                    ></div>
                    <span className="truncate" title={area}>
                      {area} ({count})
                    </span>
                  </div>
                )
              })
            }
          </div>
        </div>
      )}
    </div>
  )
}