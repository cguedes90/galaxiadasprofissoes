import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { auto = false } = await request.json()
    
    // Buscar sugestões disponíveis
    const suggestResponse = await fetch(`${request.headers.get('origin')}/api/professions/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 5 })
    })
    
    const suggestData = await suggestResponse.json()
    
    if (!suggestData.suggestions || suggestData.suggestions.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma nova profissão disponível para expansão',
        addedProfessions: [],
        totalAdded: 0
      })
    }
    
    const addedProfessions = []
    const errors = []
    
    // Adicionar cada profissão sugerida
    for (const profession of suggestData.suggestions) {
      try {
        const addResponse = await fetch(`${request.headers.get('origin')}/api/professions/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profession)
        })
        
        const addResult = await addResponse.json()
        
        if (addResult.success) {
          addedProfessions.push({
            name: profession.name,
            area: profession.area,
            id: addResult.profession?.id
          })
          
          console.log(`✨ Nova profissão adicionada: ${profession.name}`)
        } else {
          errors.push(`${profession.name}: ${addResult.error}`)
        }
        
      } catch (error) {
        errors.push(`${profession.name}: Erro ao adicionar`)
        console.error(`Erro ao adicionar ${profession.name}:`, error)
      }
    }
    
    // Atualizar estatísticas
    const totalResult = await query('SELECT COUNT(*) as total FROM professions')
    const newTotal = parseInt(totalResult.rows[0].total)
    
    return NextResponse.json({
      success: true,
      message: `Galáxia expandida! ${addedProfessions.length} nova(s) profissão(ões) adicionada(s)`,
      addedProfessions,
      totalAdded: addedProfessions.length,
      newTotalProfessions: newTotal,
      errors: errors.length > 0 ? errors : undefined,
      expansionDate: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro na expansão da galáxia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor durante expansão' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Retornar informações sobre possível expansão
    const totalResult = await query('SELECT COUNT(*) as total FROM professions')
    const currentTotal = parseInt(totalResult.rows[0].total)
    
    // Simular check de profissões disponíveis
    const availableForExpansion = Math.max(0, 50 - currentTotal) // Meta de 50 profissões
    
    const lastExpansion = await query(`
      SELECT MAX(created_at) as last_added 
      FROM professions 
      WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
    `)
    
    return NextResponse.json({
      currentTotal,
      targetTotal: 50,
      availableForExpansion,
      lastExpansion: lastExpansion.rows[0]?.last_added,
      canExpand: availableForExpansion > 0,
      recommendedExpansion: Math.min(5, availableForExpansion),
      status: currentTotal >= 50 ? 'complete' : 'expandable'
    })
    
  } catch (error) {
    console.error('Erro ao verificar expansão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}