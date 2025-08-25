export interface Profession {
  id: number
  name: string
  description: string
  area: string
  required_education: string
  salary_min: number
  salary_max: number
  formation_time: string
  main_activities: string[]
  certifications: string[]
  related_professions: string[]
  icon_color: string
  x_position: number
  y_position: number
  created_at: Date
  updated_at: Date
}

export interface ProfessionArea {
  id: string
  name: string
  color: string
  professions: Profession[]
}

export interface GalaxyPosition {
  x: number
  y: number
  scale: number
}