'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Achievement, UserProgress, Journey, WishlistItem } from '@/types/gamification'
import { DEFAULT_ACHIEVEMENTS, calculateUserLevel, getExperienceForNextLevel } from '@/data/achievements'
import { GUIDED_JOURNEYS } from '@/data/journeys'

interface GamificationPanelProps {
  isOpen: boolean
  onClose: () => void
  userProgress: UserProgress | null
  onStartJourney: (journeyId: string) => void
}

export default function GamificationPanel({ 
  isOpen, 
  onClose, 
  userProgress,
  onStartJourney 
}: GamificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements' | 'journeys' | 'wishlist'>('progress')

  if (!isOpen) return null

  const currentLevel = userProgress ? calculateUserLevel(userProgress.experience) : 1
  const expForNext = userProgress ? getExperienceForNextLevel(userProgress.experience) : 100
  const unlockedAchievements = userProgress?.achievements.filter(a => a.unlocked) || []

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Seu Progresso na Galáxia</h2>
              {userProgress && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-300">⭐</span>
                    <span>Nível {currentLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">💎</span>
                    <span>{userProgress.experience} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-300">🏆</span>
                    <span>{unlockedAchievements.length} conquistas</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b">
          {[
            { key: 'progress', label: 'Progresso', icon: '📊' },
            { key: 'achievements', label: 'Conquistas', icon: '🏆' },
            { key: 'journeys', label: 'Jornadas', icon: '🗺️' },
            { key: 'wishlist', label: 'Lista de Desejos', icon: '⭐' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 p-4 text-center font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-96">
          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {userProgress ? (
                <>
                  {/* Level Progress */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Progresso de Nível</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">⭐</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Nível {currentLevel}</span>
                          <span>{expForNext} XP para próximo nível</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(20, (userProgress.experience % 500) / 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl text-green-600 mb-2">🔍</div>
                      <div className="text-2xl font-bold text-green-600">{userProgress.professionsViewed.length}</div>
                      <div className="text-sm text-green-700">Profissões Exploradas</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl text-blue-600 mb-2">🌟</div>
                      <div className="text-2xl font-bold text-blue-600">{userProgress.areasExplored.length}</div>
                      <div className="text-sm text-blue-700">Áreas Descobertas</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl text-purple-600 mb-2">🧠</div>
                      <div className="text-2xl font-bold text-purple-600">{userProgress.testsCompleted}</div>
                      <div className="text-sm text-purple-700">Testes Completados</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl text-yellow-600 mb-2">🏆</div>
                      <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
                      <div className="text-sm text-yellow-700">Conquistas Desbloqueadas</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold mb-2">Comece Sua Jornada!</h3>
                  <p className="text-gray-600">Explore profissões para começar a ganhar experiência</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_ACHIEVEMENTS.map(achievement => {
                const userAchievement = userProgress?.achievements.find(a => a.id === achievement.id)
                const isUnlocked = userAchievement?.unlocked || false

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      isUnlocked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isUnlocked ? 'text-green-800' : 'text-gray-600'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${isUnlocked ? 'text-green-600' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        {isUnlocked && userAchievement?.unlockedAt && (
                          <p className="text-xs text-green-500 mt-1">
                            Desbloqueado em {userAchievement.unlockedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isUnlocked && (
                        <div className="text-green-500">✅</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Journeys Tab */}
          {activeTab === 'journeys' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GUIDED_JOURNEYS.map(journey => (
                <div
                  key={journey.id}
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="text-3xl p-3 rounded-full"
                      style={{ backgroundColor: `${journey.color}20` }}
                    >
                      {journey.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{journey.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{journey.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>⏱️ {journey.estimatedTime} min</span>
                        <span>📊 {journey.difficulty}</span>
                        <span>🎯 {journey.steps.length} etapas</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onStartJourney(journey.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    Iniciar Jornada
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Lista de Desejos</h3>
              <p className="text-gray-600">Recurso em desenvolvimento</p>
              <p className="text-sm text-gray-500 mt-2">
                Em breve você poderá salvar suas profissões favoritas!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}