'use client'

import { useState, useCallback } from 'react'
import { UserFavorite, FavoriteRequest } from '@/types/favorites'

interface UseFavoritesReturn {
  favorites: UserFavorite[]
  isLoading: boolean
  error: string | null
  addFavorite: (favorite: FavoriteRequest) => Promise<boolean>
  removeFavorite: (professionId: number) => Promise<boolean>
  isFavorite: (professionId: number) => boolean
  refreshFavorites: () => Promise<void>
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  const refreshFavorites = useCallback(async () => {
    const token = getAuthToken()
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setFavorites(result.data || [])
      } else {
        setError(result.message || 'Erro ao carregar favoritos')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Error fetching favorites:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addFavorite = useCallback(async (favorite: FavoriteRequest): Promise<boolean> => {
    const token = getAuthToken()
    if (!token) {
      setError('Token de autenticação não encontrado')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(favorite)
      })

      const result = await response.json()

      if (result.success) {
        // Adiciona o novo favorito ao estado local
        setFavorites(prev => [...prev, result.data])
        return true
      } else {
        setError(result.message || 'Erro ao adicionar favorito')
        return false
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Error adding favorite:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFavorite = useCallback(async (professionId: number): Promise<boolean> => {
    const token = getAuthToken()
    if (!token) {
      setError('Token de autenticação não encontrado')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/favorites?profession_id=${professionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        // Remove o favorito do estado local
        setFavorites(prev => prev.filter(fav => fav.profession_id !== professionId))
        return true
      } else {
        setError(result.message || 'Erro ao remover favorito')
        return false
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Error removing favorite:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const isFavorite = useCallback((professionId: number): boolean => {
    return favorites.some(fav => fav.profession_id === professionId)
  }, [favorites])

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites
  }
}