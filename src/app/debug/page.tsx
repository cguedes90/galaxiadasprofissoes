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
              onClick={testProfessions}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Testando...' : '📋 2. Testar API de Profissões'}
            </button>
            
            <button
              onClick={initDatabase}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Inicializando...' : '🚀 3. Inicializar Banco (se necessário)'}
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
            
            {results.type === 'professions' && results.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  ✅ <strong>API de Profissões Funcionando!</strong> 
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
            <li><strong>Primeiro:</strong> Clique em "Testar Conexão com Neon" para verificar se consegue conectar no banco</li>
            <li><strong>Se der erro:</strong> O problema é na connection string ou credenciais do Neon</li>
            <li><strong>Se conectar mas não tiver tabelas:</strong> Clique em "Inicializar Banco"</li>
            <li><strong>Depois:</strong> Teste a "API de Profissões" para ver se está funcionando</li>
            <li><strong>Por fim:</strong> Volte para a galáxia e veja se as profissões aparecem</li>
          </ol>
        </div>
      </div>
    </div>
  )
}