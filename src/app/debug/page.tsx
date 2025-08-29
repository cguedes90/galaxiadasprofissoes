'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/debug/test-neon')
      const data = await response.json()
      setResults({ type: 'success', data, status: response.status })
    } catch (error) {
      setResults({ 
        type: 'error', 
        error: error instanceof Error ? error.message : String(error),
        status: 'network_error'
      })
    }
    
    setLoading(false)
  }

  const testProfessions = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/professions')
      const data = await response.json()
      setResults({ type: 'professions', data, status: response.status })
    } catch (error) {
      setResults({ 
        type: 'error', 
        error: error instanceof Error ? error.message : String(error),
        status: 'network_error'
      })
    }
    
    setLoading(false)
  }

  const testDirectProfessions = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/professions-direct')
      const data = await response.json()
      setResults({ type: 'direct_professions', data, status: response.status })
    } catch (error) {
      setResults({ 
        type: 'error', 
        error: error instanceof Error ? error.message : String(error),
        status: 'network_error'
      })
    }
    
    setLoading(false)
  }

  const testForceConnection = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/debug/force-connection')
      const data = await response.json()
      setResults({ type: 'force_connection', data, status: response.status })
    } catch (error) {
      setResults({ 
        type: 'error', 
        error: error instanceof Error ? error.message : String(error),
        status: 'network_error'
      })
    }
    
    setLoading(false)
  }

  const initDatabase = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/debug/init-db', { method: 'POST' })
      const data = await response.json()
      setResults({ type: 'init', data, status: response.status })
    } catch (error) {
      setResults({ 
        type: 'error', 
        error: error instanceof Error ? error.message : String(error),
        status: 'network_error'
      })
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔧 Debug da Galáxia das Profissões
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes de Banco de Dados</h2>
          <p className="text-gray-600 mb-6">
            Use estes botões para testar a conexão com o banco de dados e identificar problemas.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Testando...' : '🔍 1. Testar Conexão com Neon'}
            </button>
            
            <button
              onClick={testForceConnection}
              disabled={loading}
              className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Testando...' : '🔧 2. Testar Conexão Forçada (Bypass ENV)'}
            </button>
            
            <button
              onClick={testDirectProfessions}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Testando...' : '📋 3. Testar API Profissões Direta'}
            </button>

            <button
              onClick={testProfessions}
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Testando...' : '📋 4. Testar API Original (Com ENV)'}
            </button>
            
            <button
              onClick={initDatabase}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Inicializando...' : '🚀 5. Inicializar Banco (se necessário)'}
            </button>
          </div>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              📊 Resultado do Teste {results.status && `(Status: ${results.status})`}
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
            
            {results.type === 'success' && results.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  ✅ <strong>Sucesso!</strong> Conexão com o banco funcionando.
                </p>
                {results.data.data?.professions_exist === false && (
                  <p className="text-orange-600 mt-2">
                    ⚠️ Tabela de profissões não existe. Use o botão "Inicializar Banco".
                  </p>
                )}
              </div>
            )}
            
            {results.type === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">
                  ❌ <strong>Erro:</strong> {results.error}
                </p>
              </div>
            )}
            
            {results.type === 'force_connection' && results.data?.success && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-purple-800">
                  ✅ <strong>Conexão Forçada Funcionou!</strong> 
                  {results.data.data?.professionCount && ` ${results.data.data.professionCount} profissões encontradas.`}
                </p>
                <p className="text-purple-600 text-sm mt-2">
                  🔧 Problema confirmado: Variável DATABASE_URL no Vercel não está configurada corretamente.
                </p>
              </div>
            )}

            {results.type === 'direct_professions' && results.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  ✅ <strong>API Direta Funcionando!</strong> 
                  {results.data.data?.length && ` ${results.data.data.length} profissões encontradas.`}
                </p>
                <p className="text-green-600 text-sm mt-2">
                  🚀 Use esta API temporariamente: <code>/api/professions-direct</code>
                </p>
              </div>
            )}

            {results.type === 'professions' && results.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  ✅ <strong>API Original Funcionando!</strong> 
                  {results.data.data?.length && ` ${results.data.data.length} profissões encontradas.`}
                </p>
              </div>
            )}
            
            {results.type === 'init' && results.data?.success && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800">
                  ✅ <strong>Banco Inicializado!</strong> Agora teste a API de profissões.
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Como Usar</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li><strong>Testar Conexão com Neon:</strong> Verifica se consegue conectar (deve funcionar)</li>
            <li><strong>Testar Conexão Forçada:</strong> Usa connection string hardcoded (vai mostrar detalhes do problema ENV)</li>
            <li><strong>Testar API Profissões Direta:</strong> API que funciona sem depender de variáveis de ambiente</li>
            <li><strong>Testar API Original:</strong> API normal (provavelmente vai dar erro por causa da ENV)</li>
            <li><strong>Solução:</strong> Configure DATABASE_URL no Vercel com o valor correto ou use a API direta temporariamente</li>
          </ol>
        </div>
      </div>
    </div>
  )
}