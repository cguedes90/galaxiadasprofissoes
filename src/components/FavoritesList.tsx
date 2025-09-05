'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserFavorite } from '@/types/favorites'
import { useFavorites } from '@/hooks/useFavorites'
import FavoriteButton from './FavoriteButton'
import { Profession } from '@/types/profession'

interface FavoritesListProps {
  onProfessionClick?: (profession: Partial<Profession>) => void
  limit?: number
  showEmpty?: boolean
  className?: string
}

export default function FavoritesList({ 
  onProfessionClick, 
  limit,
  showEmpty = true,
  className = '' 
}: FavoritesListProps) {
  const { favorites, isLoading, error, refreshFavorites } = useFavorites()
  const [displayFavorites, setDisplayFavorites] = useState<UserFavorite[]>([])

  useEffect(() => {
    refreshFavorites()
  }, [refreshFavorites])

  useEffect(() => {
    let filtered = favorites
    if (limit) {
      filtered = favorites.slice(0, limit)
    }
    setDisplayFavorites(filtered)
  }, [favorites, limit])

  const handleProfessionClick = (favorite: UserFavorite) => {
    if (onProfessionClick) {
      // Convert UserFavorite to partial Profession
      const profession: Partial<Profession> = {
        id: favorite.profession_id,
        name: favorite.profession_name,
        area: favorite.profession_area
      }
      onProfessionClick(profession)
    }
  }

  const handleFavoriteToggle = (professionId: number, isFavorite: boolean) => {
    // Refresh the list when a favorite is toggled
    if (!isFavorite) {
      refreshFavorites()
    }
  }

  if (isLoading && displayFavorites.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-600">Carregando favoritos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-lg">⚠️</span>
            <div className="ml-3">
              <p className="text-red-800 font-medium">Erro ao carregar favoritos</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={refreshFavorites}
            className="mt-3 text-red-700 hover:text-red-800 text-sm underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (displayFavorites.length === 0 && showEmpty) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            💫
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nenhum favorito ainda
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Explore a galáxia e clique no coração das profissões que despertam seu interesse!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Seus Favoritos</h2>
            <p className="text-sm text-gray-600">
              {displayFavorites.length} profiss{displayFavorites.length === 1 ? 'ão' : 'ões'} favorita{displayFavorites.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        
        {limit && favorites.length > limit && (
          <button
            onClick={() => setDisplayFavorites(favorites)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todos ({favorites.length})
          </button>
        )}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {displayFavorites.map((favorite, index) => (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <button
                    onClick={() => handleProfessionClick(favorite)}
                    className="text-left hover:text-blue-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {favorite.profession_name}
                    </h3>
                  </button>
                  <p className="text-sm text-gray-600 mt-1">
                    {favorite.profession_area}
                  </p>
                </div>
                
                <FavoriteButton
                  profession={{
                    id: favorite.profession_id,
                    name: favorite.profession_name,
                    area: favorite.profession_area
                  } as Profession}
                  size="sm"
                  onToggle={(isFavorite) => handleFavoriteToggle(favorite.profession_id, isFavorite)}
                />
              </div>

              {favorite.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  <span className="text-gray-500">💭</span> {favorite.notes}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Adicionado em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                </span>
                
                <button
                  onClick={() => handleProfessionClick(favorite)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver detalhes →
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading overlay for refresh */}
      <AnimatePresence>
        {isLoading && displayFavorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="ml-3 text-gray-700">Atualizando...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}