import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Lista de profissões emergentes e em alta demanda
const EMERGING_PROFESSIONS = [
  {
    name: 'Especialista em IA e Machine Learning',
    description: 'Profissional que desenvolve sistemas de inteligência artificial e aprendizado de máquina',
    area: 'Tecnologia',
    required_education: 'Ensino Superior em Ciência da Computação, Engenharia ou áreas correlatas + especialização em IA',
    salary_min: 8000,
    salary_max: 25000,
    formation_time: '4-6 anos',
    main_activities: [
      'Desenvolvimento de algoritmos de ML',
      'Análise de dados complexos',
      'Criação de modelos preditivos',
      'Implementação de sistemas de IA'
    ],
    certifications: [
      'Certificações Google Cloud ML',
      'AWS Machine Learning',
      'Microsoft Azure AI',
      'TensorFlow Certificate'
    ],
    related_professions: ['Cientista de Dados', 'Engenheiro de Software', 'Analista de Dados']
  },
  {
    name: 'Designer de Experiência em Realidade Virtual',
    description: 'Profissional que cria experiências imersivas em VR/AR',
    area: 'Design',
    required_education: 'Ensino Superior em Design, Artes Digitais ou correlatos',
    salary_min: 5000,
    salary_max: 18000,
    formation_time: '4-5 anos',
    main_activities: [
      'Desenvolvimento de interfaces VR',
      'Design de experiências imersivas',
      'Prototipagem em 3D',
      'Testes de usabilidade em VR'
    ],
    certifications: [
      'Unity Certified Developer',
      'Unreal Engine Certification',
      'VR Design Specialization'
    ],
    related_professions: ['Designer UX/UI', 'Designer Gráfico', 'Desenvolvedor de Jogos']
  },
  {
    name: 'Consultor em Sustentabilidade Empresarial',
    description: 'Profissional que ajuda empresas a implementar práticas sustentáveis',
    area: 'Meio Ambiente',
    required_education: 'Ensino Superior em Engenharia Ambiental, Administração ou correlatos',
    salary_min: 4000,
    salary_max: 15000,
    formation_time: '4-5 anos',
    main_activities: [
      'Auditoria ambiental',
      'Desenvolvimento de políticas sustentáveis',
      'Consultoria em ESG',
      'Relatórios de sustentabilidade'
    ],
    certifications: [
      'ISO 14001 Lead Auditor',
      'GRI Standards',
      'Certificação em ESG'
    ],
    related_professions: ['Engenheiro Ambiental', 'Analista de Negócios', 'Consultor Empresarial']
  },
  {
    name: 'Especialista em Cibersegurança',
    description: 'Profissional que protege sistemas digitais contra ameaças cibernéticas',
    area: 'Tecnologia',
    required_education: 'Ensino Superior em Ciência da Computação, Engenharia ou Segurança da Informação',
    salary_min: 6000,
    salary_max: 20000,
    formation_time: '4-5 anos',
    main_activities: [
      'Análise de vulnerabilidades',
      'Implementação de sistemas de segurança',
      'Resposta a incidentes',
      'Auditoria de segurança'
    ],
    certifications: [
      'CISSP',
      'CEH (Certified Ethical Hacker)',
      'CISM',
      'CompTIA Security+'
    ],
    related_professions: ['Engenheiro de Software', 'Analista de Sistemas', 'Auditor de TI']
  },
  {
    name: 'Terapeuta Digital',
    description: 'Profissional que oferece terapia e suporte psicológico através de plataformas digitais',
    area: 'Saúde',
    required_education: 'Ensino Superior em Psicologia + especialização em terapia digital',
    salary_min: 3000,
    salary_max: 12000,
    formation_time: '5-6 anos',
    main_activities: [
      'Sessões de terapia online',
      'Desenvolvimento de programas terapêuticos digitais',
      'Monitoramento de bem-estar mental',
      'Criação de conteúdo terapêutico'
    ],
    certifications: [
      'CRP (Conselho Regional de Psicologia)',
      'Certificação em Terapia Digital',
      'Especialização em Telemedicina'
    ],
    related_professions: ['Psicólogo Clínico', 'Psiquiatra', 'Coach de Vida']
  }
]

export async function POST(request: Request) {
  try {
    const { count = 1 } = await request.json()
    
    // Pegar profissões que já existem no banco
    const existingProfessions = await query('SELECT name FROM professions')
    const existingNames = existingProfessions.rows.map(row => row.name)
    
    // Filtrar profissões que ainda não existem
    const availableProfessions = EMERGING_PROFESSIONS.filter(
      prof => !existingNames.includes(prof.name)
    )
    
    if (availableProfessions.length === 0) {
      return NextResponse.json({
        message: 'Todas as profissões sugeridas já estão na galáxia!',
        suggestions: [],
        totalAvailable: 0
      })
    }
    
    // Selecionar profissões aleatoriamente
    const selectedProfessions = availableProfessions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(count, availableProfessions.length))
    
    return NextResponse.json({
      success: true,
      message: `${selectedProfessions.length} profissão(ões) sugerida(s) para adicionar à galáxia`,
      suggestions: selectedProfessions,
      totalAvailable: availableProfessions.length,
      instructions: 'Use a API /api/professions/add para adicionar essas profissões'
    })
    
  } catch (error) {
    console.error('Erro ao sugerir profissões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Retornar estatísticas das profissões
    const totalResult = await query('SELECT COUNT(*) as total FROM professions')
    const areaResult = await query(`
      SELECT area, COUNT(*) as count 
      FROM professions 
      GROUP BY area 
      ORDER BY count DESC
    `)
    
    const existingProfessions = await query('SELECT name FROM professions')
    const existingNames = existingProfessions.rows.map(row => row.name)
    
    const availableToAdd = EMERGING_PROFESSIONS.filter(
      prof => !existingNames.includes(prof.name)
    )
    
    return NextResponse.json({
      currentTotal: parseInt(totalResult.rows[0].total),
      byArea: areaResult.rows,
      availableToAdd: availableToAdd.length,
      emergingProfessions: availableToAdd.map(p => ({
        name: p.name,
        area: p.area,
        description: p.description
      }))
    })
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}