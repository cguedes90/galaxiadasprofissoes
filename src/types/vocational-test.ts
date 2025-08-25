export interface VocationalQuestion {
  id: number
  question: string
  options: VocationalOption[]
  category: string // Realista, Investigativo, Artístico, Social, Empreendedor, Convencional
}

export interface VocationalOption {
  id: string
  text: string
  categories: string[] // Pode mapear para múltiplas categorias
  weight: number // 1-3 (intensidade da preferência)
}

export interface VocationalResult {
  categories: {
    [key: string]: number
  }
  topCategories: string[]
  matchedProfessions: {
    profession: string
    compatibility: number
    reasons: string[]
  }[]
}

export interface VocationalTest {
  id: number
  title: string
  description: string
  questions: VocationalQuestion[]
  estimatedTime: number // em minutos
}

// Baseado na teoria RIASEC de John Holland
export const VOCATIONAL_CATEGORIES = {
  R: {
    name: 'Realista',
    description: 'Prefere atividades práticas, trabalho manual e com objetos concretos',
    color: '#22c55e',
    professions: ['Engenheiro Civil', 'Engenheiro Elétrico', 'Arquiteto', 'Veterinário']
  },
  I: {
    name: 'Investigativo', 
    description: 'Gosta de investigar, analisar e resolver problemas complexos',
    color: '#3b82f6',
    professions: ['Cientista de Dados', 'Biomédico', 'Químico', 'Biólogo', 'Médico Cardiologista']
  },
  A: {
    name: 'Artístico',
    description: 'Valoriza criatividade, expressão artística e originalidade',
    color: '#a855f7',
    professions: ['Designer UX/UI', 'Designer Gráfico', 'Jornalista', 'Chef de Cozinha']
  },
  S: {
    name: 'Social',
    description: 'Prefere ajudar, ensinar e cuidar de outras pessoas',
    color: '#ef4444',
    professions: ['Professor de Ensino Médio', 'Psicólogo Clínico', 'Enfermeiro', 'Psicopedagogo', 'Nutricionista', 'Fisioterapeuta']
  },
  E: {
    name: 'Empreendedor',
    description: 'Gosta de liderar, persuadir e tomar decisões de negócios',
    color: '#f59e0b',
    professions: ['Product Manager', 'Marketing Digital', 'Advogado', 'Contador']
  },
  C: {
    name: 'Convencional',
    description: 'Prefere atividades organizadas, detalhadas e sistemáticas',
    color: '#6b7280',
    professions: ['Analista de Dados', 'Farmacêutico', 'Tradutor', 'Contador']
  }
}