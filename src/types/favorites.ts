export interface UserFavorite {
  id: string
  user_id: string
  profession_id: number
  profession_name: string
  profession_area: string
  notes?: string
  created_at: Date
}

export interface UserProfessionView {
  id: string
  user_id: string
  profession_id: number
  profession_name: string
  view_count: number
  first_viewed_at: Date
  last_viewed_at: Date
}

export interface FavoriteRequest {
  profession_id: number
  profession_name: string
  profession_area: string
  notes?: string
}

export interface FavoriteResponse {
  success: boolean
  data?: UserFavorite
  message?: string
}

export interface FavoritesListResponse {
  success: boolean
  data?: UserFavorite[]
  count?: number
  message?: string
}

export interface ProfessionViewRequest {
  profession_id: number
  profession_name: string
}