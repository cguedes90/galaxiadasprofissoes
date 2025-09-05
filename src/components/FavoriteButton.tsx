'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Profession } from '@/types/profession'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  profession: Profession
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  onToggle?: (isFavorite: boolean) => void
}

export default function FavoriteButton({ 
  profession, 
  size = 'md', 
  showLabel = false, 
  className = '',
  onToggle 
}: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite, isLoading } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)
  
  const favorited = isFavorite(profession.id)

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click events
    
    if (isLoading || isAnimating) return

    setIsAnimating(true)

    try {
      if (favorited) {
        const success = await removeFavorite(profession.id)
        if (success && onToggle) {
          onToggle(false)
        }
      } else {
        const success = await addFavorite({
          profession_id: profession.id,
          profession_name: profession.name,
          profession_area: profession.area
        })
        if (success && onToggle) {
          onToggle(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [favorited, profession, addFavorite, removeFavorite, onToggle, isLoading, isAnimating])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-sm'
      case 'lg':
        return 'w-10 h-10 text-lg'
      default:
        return 'w-8 h-8 text-base'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        onClick={handleToggle}
        disabled={isLoading || isAnimating}
        className={`
          ${getSizeClasses()}
          rounded-full border-2 transition-all duration-200
          flex items-center justify-center
          disabled:opacity-50 disabled:cursor-not-allowed
          ${favorited 
            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300' 
            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-600'
          }
        `}
        whileHover={{ scale: isLoading || isAnimating ? 1 : 1.1 }}
        whileTap={{ scale: isLoading || isAnimating ? 1 : 0.95 }}
        animate={isAnimating ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
        title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        {isLoading || isAnimating ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          <motion.span
            key={favorited ? 'favorited' : 'not-favorited'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {favorited ? '❤️' : '🤍'}
          </motion.span>
        )}
      </motion.button>
      
      {showLabel && (
        <span className={`text-sm font-medium ${favorited ? 'text-red-600' : 'text-gray-600'}`}>
          {favorited ? 'Favorito' : 'Favoritar'}
        </span>
      )}
    </div>
  )
}