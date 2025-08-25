import { Journey } from '@/types/gamification'

export const GUIDED_JOURNEYS: Journey[] = [
  {
    id: 'tech_explorer',
    title: 'Explorador da Tecnologia',
    description: 'Descubra o fascinante mundo das profissões em tecnologia',
    theme: 'Tecnologia',
    color: '#3b82f6',
    icon: '💻',
    estimatedTime: 15,
    difficulty: 'beginner',
    category: 'Área Profissional',
    steps: [
      {
        id: 'view_dev',
        title: 'O Mundo do Desenvolvimento',
        description: 'Explore a profissão de Desenvolvedor Full Stack',
        type: 'view_profession',
        target: ['Desenvolvedor Full Stack'],
        completed: false,
        reward: { experience: 50 }
      },
      {
        id: 'view_data',
        title: 'A Era dos Dados',
        description: 'Conheça as oportunidades em Ciência de Dados',
        type: 'view_profession',
        target: ['Cientista de Dados', 'Analista de Dados'],
        completed: false,
        reward: { experience: 75 }
      },
      {
        id: 'view_product',
        title: 'Gerenciando Produtos Digitais',
        description: 'Descubra o papel do Product Manager',
        type: 'view_profession',
        target: ['Product Manager'],
        completed: false,
        reward: { experience: 50 }
      },
      {
        id: 'compare_tech',
        title: 'Comparando Carreiras Tech',
        description: 'Compare 2 profissões de tecnologia',
        type: 'compare_professions',
        target: ['Desenvolvedor Full Stack', 'Cientista de Dados'],
        completed: false,
        reward: { experience: 100, achievement: 'tech_specialist' }
      }
    ]
  },

  {
    id: 'health_care',
    title: 'Cuidadores da Saúde',
    description: 'Explore as diversas formas de cuidar e curar pessoas',
    theme: 'Saúde',
    color: '#ef4444',
    icon: '⚕️',
    estimatedTime: 20,
    difficulty: 'intermediate',
    category: 'Área Profissional',
    steps: [
      {
        id: 'view_medicine',
        title: 'A Arte da Medicina',
        description: 'Conheça a especialidade de Cardiologia',
        type: 'view_profession',
        target: ['Médico Cardiologista'],
        completed: false,
        reward: { experience: 60 }
      },
      {
        id: 'view_nursing',
        title: 'Cuidado Integral',
        description: 'Explore a profissão de Enfermagem',
        type: 'view_profession',
        target: ['Enfermeiro'],
        completed: false,
        reward: { experience: 50 }
      },
      {
        id: 'view_therapy',
        title: 'Reabilitação e Terapia',
        description: 'Descubra a Fisioterapia e Psicologia',
        type: 'view_profession',
        target: ['Fisioterapeuta', 'Psicólogo Clínico'],
        completed: false,
        reward: { experience: 80 }
      },
      {
        id: 'view_specialties',
        title: 'Especialidades da Saúde',
        description: 'Conheça Veterinária, Odontologia e Nutrição',
        type: 'view_profession',
        target: ['Veterinário', 'Dentista', 'Nutricionista'],
        completed: false,
        reward: { experience: 90 }
      },
      {
        id: 'health_area',
        title: 'Domínio da Área da Saúde',
        description: 'Explore toda a área da Saúde',
        type: 'explore_area',
        target: ['Saúde'],
        completed: false,
        reward: { experience: 150, achievement: 'health_specialist' }
      }
    ]
  },

  {
    id: 'creative_minds',
    title: 'Mentes Criativas',
    description: 'Jornada pelos caminhos da criatividade e expressão',
    theme: 'Criatividade',
    color: '#a855f7',
    icon: '🎨',
    estimatedTime: 12,
    difficulty: 'beginner',
    category: 'Habilidade',
    steps: [
      {
        id: 'view_design',
        title: 'Design Digital',
        description: 'Explore UX/UI e Design Gráfico',
        type: 'view_profession',
        target: ['Designer UX/UI', 'Designer Gráfico'],
        completed: false,
        reward: { experience: 70 }
      },
      {
        id: 'view_journalism',
        title: 'Contando Histórias',
        description: 'Descubra o Jornalismo',
        type: 'view_profession',
        target: ['Jornalista'],
        completed: false,
        reward: { experience: 50 }
      },
      {
        id: 'view_culinary',
        title: 'Arte Culinária',
        description: 'Explore a Gastronomia',
        type: 'view_profession',
        target: ['Chef de Cozinha'],
        completed: false,
        reward: { experience: 60 }
      },
      {
        id: 'creative_quiz',
        title: 'Teste sua Criatividade',
        description: 'Complete um teste vocacional',
        type: 'complete_quiz',
        target: ['vocational_test'],
        completed: false,
        reward: { experience: 100, achievement: 'creative_soul' }
      }
    ]
  },

  {
    id: 'first_steps',
    title: 'Primeiros Passos na Galáxia',
    description: 'Jornada introdutória para novos exploradores',
    theme: 'Introdução',
    color: '#10b981',
    icon: '🚀',
    estimatedTime: 8,
    difficulty: 'beginner',
    category: 'Tutorial',
    steps: [
      {
        id: 'first_view',
        title: 'Primeira Exploração',
        description: 'Visualize qualquer profissão',
        type: 'view_profession',
        target: [], // Qualquer profissão
        completed: false,
        reward: { experience: 25 }
      },
      {
        id: 'take_test',
        title: 'Descubra seu Perfil',
        description: 'Faça seu primeiro teste vocacional',
        type: 'complete_quiz',
        target: ['vocational_test'],
        completed: false,
        reward: { experience: 100 }
      },
      {
        id: 'explore_areas',
        title: 'Diversificando',
        description: 'Explore 3 áreas diferentes',
        type: 'explore_area',
        target: [], // Qualquer 3 áreas
        completed: false,
        reward: { experience: 75 }
      },
      {
        id: 'compare_intro',
        title: 'Primeira Comparação',
        description: 'Compare 2 profissões quaisquer',
        type: 'compare_professions',
        target: [], // Quaisquer 2 profissões
        completed: false,
        reward: { experience: 50, achievement: 'galaxy_starter' }
      }
    ]
  }
]

export const getJourneysByDifficulty = (difficulty: Journey['difficulty']): Journey[] => {
  return GUIDED_JOURNEYS.filter(journey => journey.difficulty === difficulty)
}

export const getJourneysByCategory = (category: string): Journey[] => {
  return GUIDED_JOURNEYS.filter(journey => journey.category === category)
}