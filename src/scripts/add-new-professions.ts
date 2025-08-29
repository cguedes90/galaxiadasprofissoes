#!/usr/bin/env ts-node

/**
 * Script para adicionar novas profissões únicas ao banco
 * Verifica duplicatas e adiciona profissões com posicionamento otimizado
 */

import { query } from '../lib/database'
import { log } from '../lib/logger'
import { invalidateProfessionCache } from '../lib/cache-strategy'

// Definir cores visuais para diferentes áreas
const AREA_COLORS = {
  'Tecnologia': ['#00d4aa', '#3742fa', '#4834d4', '#686de0', '#6c5ce7'],
  'Saúde': ['#ff6b6b', '#ff3838', '#ff4757', '#ff6348', '#ff9ff3'],
  'Engenharia': ['#feca57', '#ffc048', '#ff9500', '#f39c12', '#e67e22'],
  'Design': ['#9c88ff', '#00cec9', '#a29bfe', '#fd79a8', '#e84393'],
  'Educação': ['#0be881', '#2ed573', '#26de81', '#00b894', '#55a3ff'],
  'Direito': ['#48dbfb', '#0984e3', '#74b9ff', '#00cec9', '#81ecec'],
  'Finanças': ['#2ed573', '#00b894', '#26de81', '#55a3ff', '#0984e3'],
  'Comunicação': ['#ff6b6b', '#fd79a8', '#e84393', '#a29bfe', '#6c5ce7'],
  'Arte e Cultura': ['#f368e0', '#fd79a8', '#e84393', '#a29bfe', '#9c88ff'],
  'Esportes': ['#26de81', '#00b894', '#55a3ff', '#0984e3', '#74b9ff'],
  'Meio Ambiente': ['#2ed573', '#00b894', '#26de81', '#0be881', '#55a3ff']
} as const

// Lista de novas profissões para adicionar (verificando duplicatas)
const NEW_PROFESSIONS = [
  // Tecnologia
  {
    name: 'DevOps Engineer',
    description: 'Profissional que integra desenvolvimento e operações para automatizar processos',
    area: 'Tecnologia',
    required_education: 'Ensino Superior em áreas de TI + certificações',
    salary_min: 5500,
    salary_max: 20000,
    formation_time: '4-5 anos + experiência',
    main_activities: ['Automação de deployments', 'Monitoramento de infraestrutura', 'CI/CD pipelines', 'Cloud computing'],
    certifications: ['AWS Certified', 'Docker Certified', 'Kubernetes Administrator'],
    related_professions: ['Engenheiro de Software', 'Administrador de Sistemas', 'Arquiteto de Cloud']
  },
  {
    name: 'Especialista em Cybersecurity',
    description: 'Profissional que protege sistemas e dados contra ameaças cibernéticas',
    area: 'Tecnologia',
    required_education: 'Ensino Superior em TI + especializações em segurança',
    salary_min: 6000,
    salary_max: 22000,
    formation_time: '4-6 anos',
    main_activities: ['Análise de vulnerabilidades', 'Implementação de segurança', 'Monitoramento de threats', 'Auditoria de sistemas'],
    certifications: ['CISSP', 'CEH', 'Security+', 'CISM'],
    related_professions: ['Analista de Segurança', 'Consultor de TI', 'Auditor de Sistemas']
  },
  {
    name: 'Desenvolvedor Mobile',
    description: 'Especialista no desenvolvimento de aplicativos para dispositivos móveis',
    area: 'Tecnologia', 
    required_education: 'Ensino Superior em áreas de TI',
    salary_min: 4500,
    salary_max: 18000,
    formation_time: '4-5 anos',
    main_activities: ['Desenvolvimento iOS/Android', 'UI/UX mobile', 'Testes em dispositivos', 'Deploy nas lojas'],
    certifications: ['iOS Developer', 'Android Developer', 'React Native'],
    related_professions: ['Desenvolvedor Full Stack', 'Designer UX/UI', 'Product Manager']
  },

  // Saúde
  {
    name: 'Radiologista',
    description: 'Médico especialista em diagnóstico por imagem',
    area: 'Saúde',
    required_education: 'Graduação em Medicina + Residência em Radiologia',
    salary_min: 8000,
    salary_max: 30000,
    formation_time: '9-11 anos',
    main_activities: ['Interpretação de exames de imagem', 'Laudos radiológicos', 'Procedimentos intervencionistas', 'Consultoria médica'],
    certifications: ['CRM', 'Título de Especialista em Radiologia', 'Certificação em equipamentos'],
    related_professions: ['Médico Clínico', 'Técnico em Radiologia', 'Físico Médico']
  },
  {
    name: 'Fonoaudiólogo',
    description: 'Profissional que trata distúrbios da comunicação humana',
    area: 'Saúde',
    required_education: 'Ensino Superior em Fonoaudiologia',
    salary_min: 3000,
    salary_max: 12000,
    formation_time: '4-5 anos',
    main_activities: ['Avaliação audiológica', 'Terapia da fala', 'Reabilitação auditiva', 'Orientação familiar'],
    certifications: ['CRFa (Conselho Regional de Fonoaudiologia)', 'Especializações clínicas'],
    related_professions: ['Psicólogo', 'Otorrinolaringologista', 'Psicopedagogo']
  },
  {
    name: 'Terapeuta Ocupacional',
    description: 'Profissional que promove independência e qualidade de vida através de atividades',
    area: 'Saúde',
    required_education: 'Ensino Superior em Terapia Ocupacional',
    salary_min: 3200,
    salary_max: 11000,
    formation_time: '4-5 anos',
    main_activities: ['Avaliação funcional', 'Reabilitação', 'Adaptações ambientais', 'Orientação à família'],
    certifications: ['COFFITO', 'Especializações em áreas específicas'],
    related_professions: ['Fisioterapeuta', 'Psicólogo', 'Assistente Social']
  },

  // Engenharia
  {
    name: 'Engenheiro Mecânico',
    description: 'Profissional que projeta e desenvolve sistemas mecânicos',
    area: 'Engenharia',
    required_education: 'Ensino Superior em Engenharia Mecânica',
    salary_min: 4800,
    salary_max: 19000,
    formation_time: '5 anos',
    main_activities: ['Projeto de máquinas', 'Análise térmica', 'Automação industrial', 'Manutenção'],
    certifications: ['CREA', 'Certificações em CAD/CAM', 'Six Sigma'],
    related_professions: ['Engenheiro de Produção', 'Engenheiro Industrial', 'Designer Industrial']
  },
  {
    name: 'Engenheiro Químico',
    description: 'Profissional que aplica princípios químicos em processos industriais',
    area: 'Engenharia',
    required_education: 'Ensino Superior em Engenharia Química',
    salary_min: 5200,
    salary_max: 20000,
    formation_time: '5 anos',
    main_activities: ['Projeto de processos', 'Controle de qualidade', 'Otimização industrial', 'Segurança química'],
    certifications: ['CREA', 'CRQ', 'Certificações em processos'],
    related_professions: ['Químico', 'Engenheiro de Processos', 'Engenheiro Ambiental']
  },

  // Educação
  {
    name: 'Pedagogo',
    description: 'Profissional especializado em processos educativos e gestão escolar',
    area: 'Educação',
    required_education: 'Ensino Superior em Pedagogia',
    salary_min: 2200,
    salary_max: 9000,
    formation_time: '4 anos',
    main_activities: ['Coordenação pedagógica', 'Planejamento educacional', 'Orientação educacional', 'Gestão escolar'],
    certifications: ['Registro no MEC', 'Especializações em educação'],
    related_professions: ['Professor', 'Psicopedagogo', 'Diretor Escolar']
  },
  {
    name: 'Professor Universitário',
    description: 'Educador de ensino superior especializado em pesquisa e ensino',
    area: 'Educação',
    required_education: 'Mestrado ou Doutorado na área de especialização',
    salary_min: 4000,
    salary_max: 15000,
    formation_time: '6-8 anos',
    main_activities: ['Ministrar aulas superiores', 'Pesquisa científica', 'Orientação de alunos', 'Publicação acadêmica'],
    certifications: ['Título de Mestre/Doutor', 'Registro no MEC'],
    related_professions: ['Pesquisador', 'Professor de Ensino Médio', 'Coordenador de Curso']
  },

  // Arte e Cultura
  {
    name: 'Músico Profissional',
    description: 'Artista que cria, interpreta e produz música',
    area: 'Arte e Cultura',
    required_education: 'Formação musical (conservatório, superior ou autodidata)',
    salary_min: 1500,
    salary_max: 15000,
    formation_time: '4+ anos',
    main_activities: ['Composição musical', 'Performance', 'Gravação', 'Ensino musical'],
    certifications: ['Formação em conservatório', 'Certificações em instrumentos'],
    related_professions: ['Professor de Música', 'Produtor Musical', 'Compositor']
  },
  {
    name: 'Designer de Games',
    description: 'Profissional que cria conceitos e mecânicas para jogos digitais',
    area: 'Arte e Cultura',
    required_education: 'Ensino Superior em Design de Games ou correlatos',
    salary_min: 3500,
    salary_max: 16000,
    formation_time: '4-5 anos',
    main_activities: ['Criação de conceitos', 'Level design', 'Balanceamento de gameplay', 'Prototipação'],
    certifications: ['Certificações em engines de jogos', 'Portfolio de games'],
    related_professions: ['Desenvolvedor de Games', 'Artista 3D', 'Programador']
  },

  // Comunicação
  {
    name: 'Social Media Manager',
    description: 'Especialista em gestão de redes sociais e comunicação digital',
    area: 'Comunicação',
    required_education: 'Ensino Superior em Comunicação, Marketing ou correlatos',
    salary_min: 2800,
    salary_max: 12000,
    formation_time: '4 anos',
    main_activities: ['Gestão de redes sociais', 'Criação de conteúdo', 'Análise de métricas', 'Relacionamento com público'],
    certifications: ['Certificações em redes sociais', 'Marketing Digital'],
    related_professions: ['Marketing Digital', 'Designer Gráfico', 'Redator']
  },
  {
    name: 'Publicitário',
    description: 'Profissional que cria campanhas publicitárias e estratégias de comunicação',
    area: 'Comunicação',
    required_education: 'Ensino Superior em Publicidade e Propaganda',
    salary_min: 3200,
    salary_max: 14000,
    formation_time: '4 anos',
    main_activities: ['Criação publicitária', 'Planejamento de campanhas', 'Atendimento a clientes', 'Pesquisa de mercado'],
    certifications: ['Registro profissional', 'Certificações em ferramentas criativas'],
    related_professions: ['Marketing Digital', 'Designer Gráfico', 'Social Media Manager']
  },

  // Esportes
  {
    name: 'Educador Físico',
    description: 'Profissional que promove saúde através de atividades físicas',
    area: 'Esportes',
    required_education: 'Ensino Superior em Educação Física',
    salary_min: 2500,
    salary_max: 10000,
    formation_time: '4 anos',
    main_activities: ['Personal trainer', 'Aulas em academias', 'Reabilitação física', 'Esportes coletivos'],
    certifications: ['CREF', 'Especializações em modalidades'],
    related_professions: ['Fisioterapeuta', 'Nutricionista', 'Preparador Físico']
  },
  {
    name: 'Preparador Físico',
    description: 'Especialista em condicionamento físico para atletas e equipes',
    area: 'Esportes',
    required_education: 'Ensino Superior em Educação Física + especialização',
    salary_min: 3500,
    salary_max: 15000,
    formation_time: '4-6 anos',
    main_activities: ['Treinamento específico', 'Avaliação física', 'Prevenção de lesões', 'Periodização'],
    certifications: ['CREF', 'Especialização em treinamento esportivo'],
    related_professions: ['Educador Físico', 'Fisioterapeuta', 'Nutricionista Esportivo']
  },

  // Meio Ambiente
  {
    name: 'Engenheiro Ambiental',
    description: 'Profissional que desenvolve soluções para problemas ambientais',
    area: 'Meio Ambiente',
    required_education: 'Ensino Superior em Engenharia Ambiental',
    salary_min: 4200,
    salary_max: 16000,
    formation_time: '5 anos',
    main_activities: ['Gestão ambiental', 'Tratamento de efluentes', 'Licenciamento ambiental', 'Consultoria sustentável'],
    certifications: ['CREA', 'Certificações ambientais', 'ISO 14001'],
    related_professions: ['Biólogo', 'Engenheiro Sanitário', 'Consultor Ambiental']
  },
  {
    name: 'Geólogo',
    description: 'Cientista que estuda a Terra e seus processos',
    area: 'Meio Ambiente',
    required_education: 'Ensino Superior em Geologia',
    salary_min: 4000,
    salary_max: 18000,
    formation_time: '4-5 anos',
    main_activities: ['Mapeamento geológico', 'Análise de solos', 'Exploração mineral', 'Estudos ambientais'],
    certifications: ['CREA', 'Certificações em geotecnia'],
    related_professions: ['Engenheiro de Minas', 'Engenheiro Civil', 'Geógrafo']
  },

  // Finanças
  {
    name: 'Analista Financeiro',
    description: 'Profissional que analisa investimentos e performance financeira',
    area: 'Finanças',
    required_education: 'Ensino Superior em Economia, Administração ou correlatos',
    salary_min: 3800,
    salary_max: 16000,
    formation_time: '4-5 anos',
    main_activities: ['Análise de investimentos', 'Modelagem financeira', 'Relatórios gerenciais', 'Due diligence'],
    certifications: ['CFA', 'Certificações em mercado de capitais'],
    related_professions: ['Contador', 'Economista', 'Consultor Financeiro']
  },
  {
    name: 'Economista',
    description: 'Profissional que estuda e analisa sistemas econômicos',
    area: 'Finanças',
    required_education: 'Ensino Superior em Economia',
    salary_min: 4200,
    salary_max: 18000,
    formation_time: '4-5 anos',
    main_activities: ['Análise econômica', 'Pesquisa de mercado', 'Consultoria econômica', 'Planejamento estratégico'],
    certifications: ['CORECON', 'Certificações em análise econômica'],
    related_professions: ['Analista Financeiro', 'Consultor', 'Pesquisador']
  },

  // Arte e Design
  {
    name: 'Ilustrador',
    description: 'Artista que cria ilustrações para diversos meios e propósitos',
    area: 'Arte e Cultura',
    required_education: 'Ensino Superior em Artes Visuais, Design ou autodidata',
    salary_min: 2200,
    salary_max: 12000,
    formation_time: '4 anos + portfolio',
    main_activities: ['Criação de ilustrações', 'Arte digital', 'Concept art', 'Ilustração editorial'],
    certifications: ['Portfolio profissional', 'Certificações em softwares'],
    related_professions: ['Designer Gráfico', 'Artista Conceitual', 'Animador']
  },
  {
    name: 'Fotógrafo',
    description: 'Profissional que captura imagens para diversos fins',
    area: 'Arte e Cultura',
    required_education: 'Curso técnico/superior em Fotografia ou autodidata',
    salary_min: 2000,
    salary_max: 15000,
    formation_time: '2-4 anos',
    main_activities: ['Sessões fotográficas', 'Edição de imagens', 'Direção de arte', 'Vendas de trabalhos'],
    certifications: ['Portfolio profissional', 'Certificações técnicas'],
    related_professions: ['Designer Gráfico', 'Cinegrafista', 'Editor de Imagens']
  },

  // Direito
  {
    name: 'Delegado de Polícia',
    description: 'Autoridade policial responsável por investigações e inquéritos',
    area: 'Direito',
    required_education: 'Ensino Superior em Direito + concurso público',
    salary_min: 8000,
    salary_max: 25000,
    formation_time: '5+ anos + concurso',
    main_activities: ['Investigação criminal', 'Inquéritos policiais', 'Prisões', 'Coordenação de equipes'],
    certifications: ['Aprovação em concurso', 'Cursos de especialização policial'],
    related_professions: ['Advogado', 'Investigador', 'Perito Criminal']
  },
  {
    name: 'Juiz',
    description: 'Magistrado que julga processos e aplica a justiça',
    area: 'Direito',
    required_education: 'Ensino Superior em Direito + concurso + experiência',
    salary_min: 15000,
    salary_max: 35000,
    formation_time: '8+ anos',
    main_activities: ['Julgamento de processos', 'Decisões judiciais', 'Audiências', 'Despachos'],
    certifications: ['Aprovação em concurso de magistratura', 'Formação continuada'],
    related_professions: ['Advogado', 'Promotor', 'Desembargador']
  },

  // Administração
  {
    name: 'Administrador',
    description: 'Profissional que gerencia organizações e processos empresariais',
    area: 'Administração',
    required_education: 'Ensino Superior em Administração',
    salary_min: 3000,
    salary_max: 15000,
    formation_time: '4 anos',
    main_activities: ['Gestão empresarial', 'Planejamento estratégico', 'Recursos humanos', 'Finanças corporativas'],
    certifications: ['CRA', 'MBA', 'Certificações em gestão'],
    related_professions: ['Analista de RH', 'Consultor Empresarial', 'Gerente de Projetos']
  },
  {
    name: 'Recursos Humanos',
    description: 'Especialista em gestão de pessoas e desenvolvimento organizacional',
    area: 'Administração',
    required_education: 'Ensino Superior em RH, Psicologia ou Administração',
    salary_min: 3200,
    salary_max: 14000,
    formation_time: '4-5 anos',
    main_activities: ['Recrutamento e seleção', 'Treinamento', 'Avaliação de desempenho', 'Relações trabalhistas'],
    certifications: ['Certificações em RH', 'Coaching', 'Gestão de talentos'],
    related_professions: ['Psicólogo Organizacional', 'Administrador', 'Coach']
  }
]

// Função para gerar posição única na galáxia
function generateUniquePosition(existingPositions: Array<{x: number, y: number}>): {x: number, y: number} {
  const maxAttempts = 100
  const minDistance = 60 // Distância mínima entre estrelas
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.random() * 800 + 50  // Entre 50 e 850
    const y = Math.random() * 600 + 50  // Entre 50 e 650
    
    // Verificar se está muito próximo de outras profissões
    const tooClose = existingPositions.some(pos => {
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))
      return distance < minDistance
    })
    
    if (!tooClose) {
      return { x, y }
    }
  }
  
  // Fallback se não conseguir posição única
  return {
    x: Math.random() * 800 + 50,
    y: Math.random() * 600 + 50
  }
}

// Função para obter cor da área
function getAreaColor(area: string, usedColors: string[]): string {
  const areaColors = AREA_COLORS[area as keyof typeof AREA_COLORS] || ['#ffffff', '#cccccc', '#999999']
  
  // Tentar encontrar uma cor não usada
  const availableColor = areaColors.find(color => !usedColors.includes(color))
  
  if (availableColor) {
    return availableColor
  }
  
  // Se todas as cores da área estão em uso, usar uma aleatória da área
  return areaColors[Math.floor(Math.random() * areaColors.length)]
}

async function addNewProfessions() {
  try {
    log.info('Starting process to add new professions')

    // 1. Verificar profissões existentes
    const existingResult = await query('SELECT name, x_position, y_position, icon_color FROM professions')
    const existingProfessions = existingResult.rows
    const existingNames = existingProfessions.map((p: any) => p.name.toLowerCase())
    const existingPositions = existingProfessions.map((p: any) => ({ x: p.x_position, y: p.y_position }))
    const usedColors = existingProfessions.map((p: any) => p.icon_color)

    log.info('Found existing professions', { 
      count: existingProfessions.length,
      names: existingNames 
    })

    // 2. Filtrar profissões novas (não duplicadas)
    const newProfessionsToAdd = NEW_PROFESSIONS.filter(profession => {
      const isDuplicate = existingNames.includes(profession.name.toLowerCase())
      if (isDuplicate) {
        log.debug('Skipping duplicate profession', { name: profession.name })
      }
      return !isDuplicate
    })

    log.info('New professions to add', { 
      count: newProfessionsToAdd.length,
      names: newProfessionsToAdd.map(p => p.name)
    })

    // 3. Adicionar cada nova profissão
    let addedCount = 0
    for (const profession of newProfessionsToAdd) {
      try {
        // Gerar posição única
        const position = generateUniquePosition(existingPositions)
        existingPositions.push(position)
        
        // Gerar cor única para a área
        const color = getAreaColor(profession.area, usedColors)
        usedColors.push(color)

        // Inserir no banco
        await query(
          `INSERT INTO professions (
            name, description, area, required_education, 
            salary_min, salary_max, formation_time, 
            main_activities, certifications, related_professions, 
            icon_color, x_position, y_position
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            profession.name,
            profession.description,
            profession.area,
            profession.required_education,
            profession.salary_min,
            profession.salary_max,
            profession.formation_time,
            profession.main_activities,
            profession.certifications,
            profession.related_professions,
            color,
            position.x,
            position.y
          ]
        )

        addedCount++
        log.info('Added new profession', { 
          name: profession.name, 
          area: profession.area,
          position,
          color
        })

      } catch (error) {
        log.error('Failed to add profession', { 
          name: profession.name, 
          error 
        })
      }
    }

    // 4. Invalidar cache
    await invalidateProfessionCache()
    
    // 5. Obter estatísticas finais
    const finalCount = await query('SELECT COUNT(*) as count FROM professions')
    const totalProfessions = finalCount.rows[0].count

    log.info('Profession addition completed', {
      existingCount: existingProfessions.length,
      addedCount,
      finalTotal: totalProfessions
    })

    return {
      success: true,
      existingCount: existingProfessions.length,
      addedCount,
      finalTotal: totalProfessions,
      newProfessions: newProfessionsToAdd.slice(0, addedCount).map(p => p.name)
    }

  } catch (error) {
    log.error('Error in addNewProfessions script', error)
    throw error
  }
}

// Execute if called directly
if (require.main === module) {
  addNewProfessions()
    .then(result => {
      console.log('✅ Script completed successfully:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { addNewProfessions }