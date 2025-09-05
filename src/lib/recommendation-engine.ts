import { Profession } from '@/types/profession'
import { VocationalResult } from '@/types/vocational-test'
import { UserFavorite } from '@/types/favorites'
import { 
  RecommendationContext, 
  ProfessionRecommendation, 
  RecommendationsResult,
  RecommendationReason,
  RecommendationFilters 
} from '@/types/recommendations'

export class RecommendationEngine {
  private professions: Profession[]

  constructor(professions: Profession[]) {
    this.professions = professions
  }

  generateRecommendations(
    context: RecommendationContext,
    filters?: RecommendationFilters
  ): RecommendationsResult {
    const recommendations: ProfessionRecommendation[] = []
    
    // Aplicar filtros básicos
    let filteredProfessions = this.applyFilters(this.professions, filters)
    
    // Excluir profissões já visualizadas muito recentemente se necessário
    if (context.viewedProfessions && context.viewedProfessions.length > 10) {
      const recentlyViewed = context.viewedProfessions.slice(-5)
      filteredProfessions = filteredProfessions.filter(p => 
        !recentlyViewed.includes(p.name)
      )
    }

    for (const profession of filteredProfessions) {
      const recommendation = this.calculateRecommendationScore(profession, context)
      if (recommendation.score > 20) { // Threshold mínimo
        recommendations.push(recommendation)
      }
    }

    // Ordenar por score
    recommendations.sort((a, b) => b.score - a.score)

    // Limitar resultados
    const limit = filters?.limit || 12
    const limitedRecommendations = recommendations.slice(0, limit)

    // Calcular summary
    const summary = this.generateSummary(limitedRecommendations)

    return {
      recommendations: limitedRecommendations,
      context,
      generatedAt: new Date(),
      summary
    }
  }

  private applyFilters(professions: Profession[], filters?: RecommendationFilters): Profession[] {
    if (!filters) return professions

    return professions.filter(profession => {
      // Filtro de salário
      if (filters.salaryMin && profession.salary_max < filters.salaryMin) return false
      if (filters.salaryMax && profession.salary_min > filters.salaryMax) return false
      
      // Filtro de tempo de educação
      if (filters.maxEducationTime) {
        const timeMatch = profession.formation_time.match(/(\d+)/)
        const years = timeMatch ? parseInt(timeMatch[1]) : 5
        if (years > filters.maxEducationTime) return false
      }

      // Filtro de áreas
      if (filters.excludeAreas && filters.excludeAreas.includes(profession.area)) return false
      if (filters.includeAreas && filters.includeAreas.length > 0 && !filters.includeAreas.includes(profession.area)) return false

      return true
    })
  }

  private calculateRecommendationScore(
    profession: Profession, 
    context: RecommendationContext
  ): ProfessionRecommendation {
    let score = 40 // Score base
    const reasons: RecommendationReason[] = []

    // 1. Análise vocacional (peso 40%)
    if (context.vocationalResult) {
      const vocationalScore = this.calculateVocationalScore(profession, context.vocationalResult)
      score += vocationalScore * 0.4
      
      if (vocationalScore > 70) {
        reasons.push({
          type: 'vocational',
          description: 'Alta compatibilidade com seu perfil vocacional',
          confidence: vocationalScore
        })
      } else if (vocationalScore > 50) {
        reasons.push({
          type: 'vocational',
          description: 'Boa compatibilidade com seu teste vocacional',
          confidence: vocationalScore
        })
      }
    }

    // 2. Análise comportamental baseada em favoritos (peso 25%)
    if (context.favorites && context.favorites.length > 0) {
      const behavioralScore = this.calculateBehavioralScore(profession, context.favorites)
      score += behavioralScore * 0.25

      if (behavioralScore > 60) {
        reasons.push({
          type: 'behavioral',
          description: 'Similar às suas profissões favoritas',
          confidence: behavioralScore
        })
      }
    }

    // 3. Afinidade com áreas exploradas (peso 20%)
    if (context.areasExplored && context.areasExplored.length > 0) {
      const areaAffinityScore = this.calculateAreaAffinityScore(profession, context.areasExplored)
      score += areaAffinityScore * 0.2

      if (areaAffinityScore > 70) {
        reasons.push({
          type: 'area_affinity',
          description: `Você demonstrou interesse na área de ${profession.area}`,
          confidence: areaAffinityScore
        })
      }
    }

    // 4. Fatores demográficos e contextuais (peso 15%)
    const demographicScore = this.calculateDemographicScore(profession, context)
    score += demographicScore * 0.15

    // 5. Trending/Popular professions (peso extra)
    if (this.isTrendingProfession(profession)) {
      score += 10
      reasons.push({
        type: 'trending',
        description: 'Profissão em alta no mercado de trabalho',
        confidence: 80
      })
    }

    // Determinar categoria
    let category: ProfessionRecommendation['category'] = 'explore'
    if (score >= 85) category = 'perfect_match'
    else if (score >= 70) category = 'good_match'
    else if (this.isTrendingProfession(profession)) category = 'trending'

    return {
      profession,
      score: Math.min(Math.round(score), 100),
      reasons: reasons.length > 0 ? reasons : [{
        type: 'behavioral',
        description: 'Pode ser uma boa opção para explorar',
        confidence: 50
      }],
      category
    }
  }

  private calculateVocationalScore(profession: Profession, vocationalResult: VocationalResult): number {
    const professionAreaMapping: { [key: string]: string[] } = {
      'Tecnologia': ['I', 'C'],
      'Saúde': ['S', 'I'],
      'Design': ['A', 'I'],
      'Engenharia': ['R', 'I'],
      'Educação': ['S', 'C'],
      'Direito': ['E', 'C'],
      'Marketing': ['E', 'A'],
      'Finanças': ['C', 'E'],
      'Comunicação': ['A', 'S'],
      'Gastronomia': ['R', 'A'],
      'Arquitetura': ['A', 'R'],
      'Linguagens': ['A', 'C'],
      'Ciências Biológicas': ['I', 'S'],
      'Ciências Exatas': ['I', 'C'],
      'Meio Ambiente': ['I', 'S']
    }

    const relevantCategories = professionAreaMapping[profession.area] || []
    if (relevantCategories.length === 0) return 50 // Score neutro se não mapear

    let totalScore = 0
    for (const category of relevantCategories) {
      const categoryScore = vocationalResult.categories[category] || 0
      totalScore += categoryScore
    }

    return totalScore / relevantCategories.length
  }

  private calculateBehavioralScore(profession: Profession, favorites: UserFavorite[]): number {
    let score = 0
    let factors = 0

    // Mesmo área que favoritos
    const sameAreaFavorites = favorites.filter(fav => fav.profession_area === profession.area)
    if (sameAreaFavorites.length > 0) {
      score += 70
      factors++
    }

    // Áreas relacionadas
    const relatedAreas = this.getRelatedAreas(profession.area)
    const relatedAreaFavorites = favorites.filter(fav => 
      relatedAreas.includes(fav.profession_area)
    )
    if (relatedAreaFavorites.length > 0) {
      score += 40
      factors++
    }

    // Faixa salarial similar
    const avgFavoriteSalary = favorites.length > 0 ? 
      favorites.reduce((acc, fav) => acc + 5000, 0) / favorites.length : // Estimativa
      profession.salary_min

    const professionAvgSalary = (profession.salary_min + profession.salary_max) / 2
    const salaryDifference = Math.abs(professionAvgSalary - avgFavoriteSalary) / avgFavoriteSalary
    
    if (salaryDifference < 0.3) { // Diferença menor que 30%
      score += 30
      factors++
    }

    return factors > 0 ? score / factors : 30
  }

  private calculateAreaAffinityScore(profession: Profession, areasExplored: string[]): number {
    if (areasExplored.includes(profession.area)) {
      return 80 // Alta afinidade com área já explorada
    }

    // Verificar áreas relacionadas
    const relatedAreas = this.getRelatedAreas(profession.area)
    const relatedExplored = areasExplored.filter(area => relatedAreas.includes(area))
    
    if (relatedExplored.length > 0) {
      return 50 + (relatedExplored.length * 10) // Afinidade moderada
    }

    return 20 // Afinidade baixa
  }

  private calculateDemographicScore(profession: Profession, context: RecommendationContext): number {
    let score = 50 // Score neutro

    // Idade (se disponível)
    if (context.age) {
      if (context.age < 25) {
        // Jovens: profissões com crescimento e tecnologia
        if (['Tecnologia', 'Design', 'Marketing'].includes(profession.area)) {
          score += 20
        }
      } else if (context.age > 35) {
        // Mais experientes: profissões estáveis e especializadas
        if (['Saúde', 'Educação', 'Finanças'].includes(profession.area)) {
          score += 15
        }
      }
    }

    // Nível educacional (se disponível)
    if (context.educationLevel) {
      const professionEducationYears = this.extractEducationYears(profession.formation_time)
      
      if (context.educationLevel === 'ensino_superior' && professionEducationYears <= 4) {
        score += 10
      } else if (context.educationLevel === 'pos_graduacao' && professionEducationYears <= 6) {
        score += 15
      }
    }

    return Math.min(score, 100)
  }

  private isTrendingProfession(profession: Profession): boolean {
    const trendingProfessions = [
      'Cientista de Dados',
      'Engenheiro de Software',
      'Designer UX/UI', 
      'Especialista em IA e Machine Learning',
      'Product Manager',
      'Marketing Digital',
      'Especialista em Cibersegurança',
      'Designer de Experiência em Realidade Virtual',
      'Terapeuta Digital'
    ]

    return trendingProfessions.includes(profession.name)
  }

  private getRelatedAreas(area: string): string[] {
    const relationMap: { [key: string]: string[] } = {
      'Tecnologia': ['Design', 'Engenharia'],
      'Saúde': ['Ciências Biológicas', 'Educação'],
      'Design': ['Tecnologia', 'Comunicação', 'Arquitetura'],
      'Engenharia': ['Tecnologia', 'Arquitetura'],
      'Educação': ['Saúde', 'Comunicação'],
      'Direito': ['Finanças', 'Marketing'],
      'Marketing': ['Comunicação', 'Design'],
      'Finanças': ['Direito', 'Tecnologia'],
      'Comunicação': ['Marketing', 'Design', 'Educação'],
      'Arquitetura': ['Design', 'Engenharia'],
      'Ciências Biológicas': ['Saúde', 'Meio Ambiente'],
      'Meio Ambiente': ['Ciências Biológicas', 'Engenharia']
    }

    return relationMap[area] || []
  }

  private extractEducationYears(formationTime: string): number {
    const match = formationTime.match(/(\d+)/)
    return match ? parseInt(match[1]) : 4
  }

  private generateSummary(recommendations: ProfessionRecommendation[]) {
    const perfectMatches = recommendations.filter(r => r.category === 'perfect_match').length
    const goodMatches = recommendations.filter(r => r.category === 'good_match').length
    const exploreOptions = recommendations.filter(r => r.category === 'explore').length
    const trendingOptions = recommendations.filter(r => r.category === 'trending').length

    // Análise dos principais motivos
    const reasonCounts: { [key: string]: number } = {}
    recommendations.forEach(rec => {
      rec.reasons.forEach(reason => {
        reasonCounts[reason.type] = (reasonCounts[reason.type] || 0) + 1
      })
    })

    const primaryReasons = Object.entries(reasonCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => {
        switch(reason) {
          case 'vocational': return 'Compatibilidade com perfil vocacional'
          case 'behavioral': return 'Baseado em suas preferências'
          case 'trending': return 'Profissões em alta'
          case 'area_affinity': return 'Afinidade com áreas exploradas'
          default: return reason
        }
      })

    return {
      totalRecommendations: recommendations.length,
      perfectMatches,
      exploreOptions: exploreOptions + goodMatches,
      trendingOptions,
      primaryReasons
    }
  }
}