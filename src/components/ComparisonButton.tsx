'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Profession } from '@/types/profession'
import { useComparison } from '@/hooks/useComparison'

interface ComparisonButtonProps {
  profession: Profession
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function ComparisonButton({ 
  profession, 
  size = 'md', 
  showLabel = false, 
  className = '' 
}: ComparisonButtonProps) {
  const { addToComparison, removeFromComparison, isInComparison, comparisons } = useComparison()
  const [isAnimating, setIsAnimating] = useState(false)
  
  const inComparison = isInComparison(profession.id)
  const isMaxReached = comparisons.length >= 4 && !inComparison

  const handleToggle = async () => {
    if (isMaxReached || isAnimating) return

    setIsAnimating(true)

    try {
      if (inComparison) {
        removeFromComparison(profession.id)
      } else {
        addToComparison(profession)
      }
    } catch (error) {
      console.error('Error toggling comparison:', error)
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs'
      case 'lg':
        return 'w-10 h-10 text-lg'
      default:
        return 'w-8 h-8 text-sm'
    }
  }

  const getIcon = () => {
    if (inComparison) return '⚖️'
    if (isMaxReached) return '🔒'
    return '📊'
  }

  const getTooltip = () => {
    if (inComparison) return 'Remover da comparação'
    if (isMaxReached) return 'Máximo de 4 profissões para comparação'
    return 'Adicionar à comparação'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        onClick={handleToggle}
        disabled={isMaxReached || isAnimating}
        className={`
          ${getSizeClasses()}
          rounded-full border-2 transition-all duration-200
          flex items-center justify-center
          disabled:opacity-50 disabled:cursor-not-allowed
          ${inComparison 
            ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300' 
            : isMaxReached
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
          }
        `}
        whileHover={{ scale: isMaxReached || isAnimating ? 1 : 1.1 }}
        whileTap={{ scale: isMaxReached || isAnimating ? 1 : 0.95 }}
        animate={isAnimating ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
        title={getTooltip()}
      >
        {isAnimating ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border border-current border-t-transparent rounded-full"
          />
        ) : (
          <motion.span
            key={inComparison ? 'in-comparison' : 'not-in-comparison'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {getIcon()}
          </motion.span>
        )}
      </motion.button>
      
      {showLabel && (
        <span className={`text-sm font-medium ${
          inComparison ? 'text-blue-600' : 
          isMaxReached ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {inComparison ? 'Na comparação' : isMaxReached ? 'Limite atingido' : 'Comparar'}
        </span>
      )}

      {/* Counter badge */}
      {comparisons.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {comparisons.length}
        </motion.div>
      )}
    </div>
  )
}