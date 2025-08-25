import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST() {
  try {
    // Definir posições mais próximas e organizadas por clusters
    const professionPositions = [
      // Cluster Tecnologia (centro-esquerda)
      { name: 'Desenvolvedor Full Stack', x: 20, y: 30 },
      { name: 'Cientista de Dados', x: 40, y: 20 },
      { name: 'Engenheiro de Software', x: 60, y: 40 },
      { name: 'Analista de Dados', x: 30, y: 60 },
      { name: 'Product Manager', x: 50, y: 10 },
      
      // Cluster Saúde (centro-direita)
      { name: 'Médico Cardiologista', x: 120, y: 30 },
      { name: 'Enfermeiro', x: 140, y: 50 },
      { name: 'Dentista', x: 100, y: 60 },
      { name: 'Veterinário', x: 130, y: 10 },
      { name: 'Fisioterapeuta', x: 110, y: 80 },
      { name: 'Biomédico', x: 150, y: 30 },
      { name: 'Farmacêutico', x: 90, y: 40 },
      { name: 'Nutricionista', x: 120, y: 70 },
      { name: 'Psicólogo Clínico', x: 140, y: 20 },
      
      // Cluster Engenharia (parte superior)
      { name: 'Engenheiro Civil', x: 70, y: -20 },
      { name: 'Engenheiro Elétrico', x: 90, y: -10 },
      { name: 'Arquiteto', x: 50, y: -30 },
      
      // Cluster Design (centro-baixo)
      { name: 'Designer UX/UI', x: 20, y: 100 },
      { name: 'Designer Gráfico', x: 40, y: 90 },
      
      // Cluster Educação (esquerda-baixo)
      { name: 'Professor de Ensino Médio', x: -20, y: 80 },
      { name: 'Psicopedagogo', x: -10, y: 100 },
      
      // Cluster Negócios (direita-baixo)
      { name: 'Advogado', x: 160, y: 80 },
      { name: 'Contador', x: 180, y: 60 },
      { name: 'Marketing Digital', x: 170, y: 100 },
      
      // Outras profissões distribuídas
      { name: 'Jornalista', x: 0, y: 50 },
      { name: 'Chef de Cozinha', x: 80, y: 120 },
      { name: 'Tradutor', x: -30, y: 60 },
      { name: 'Biólogo', x: 200, y: 40 },
      { name: 'Químico', x: 190, y: 20 }
    ]

    // Atualizar posições no banco
    for (const position of professionPositions) {
      await query(
        'UPDATE professions SET x_position = $1, y_position = $2 WHERE name = $3',
        [position.x, position.y, position.name]
      )
    }

    return NextResponse.json({ 
      message: 'Posições atualizadas com sucesso', 
      updated: professionPositions.length 
    })
  } catch (error) {
    console.error('Erro ao atualizar posições:', error)
    return NextResponse.json({ error: 'Falha ao atualizar posições' }, { status: 500 })
  }
}