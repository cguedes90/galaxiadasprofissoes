// Script para testar a expansão da galáxia
console.log('🌟 Testando expansão da Galáxia das Profissões...\n')

async function testExpansion() {
  const baseUrl = 'http://localhost:3000'
  
  try {
    console.log('1. Verificando estatísticas atuais...')
    const statsResponse = await fetch(`${baseUrl}/api/professions/suggest`)
    const stats = await statsResponse.json()
    
    console.log(`📊 Profissões atuais: ${stats.currentTotal}`)
    console.log(`📊 Disponíveis para adicionar: ${stats.availableToAdd}`)
    console.log(`📊 Áreas: ${stats.byArea?.length || 'N/A'}\n`)
    
    if (stats.availableToAdd > 0) {
      console.log('2. Iniciando expansão automática...')
      const expandResponse = await fetch(`${baseUrl}/api/professions/expand-galaxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto: true })
      })
      
      const result = await expandResponse.json()
      
      if (result.success) {
        console.log(`✅ Sucesso! ${result.totalAdded} profissão(ões) adicionada(s)`)
        console.log(`🎉 Nova quantidade total: ${result.newTotalProfessions}`)
        
        if (result.addedProfessions) {
          console.log('\n🌟 Profissões adicionadas:')
          result.addedProfessions.forEach(prof => {
            console.log(`  • ${prof.name} (${prof.area})`)
          })
        }
      } else {
        console.log(`❌ Erro: ${result.message}`)
      }
    } else {
      console.log('ℹ️  Não há profissões disponíveis para adicionar no momento.')
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message)
  }
}

testExpansion()