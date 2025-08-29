'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Carregamento dinâmico do SwaggerUI para evitar problemas de SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiSpec = async () => {
      try {
        const response = await fetch('/api/docs')
        if (!response.ok) {
          throw new Error('Falha ao carregar documentação da API')
        }
        const apiSpec = await response.json()
        setSpec(apiSpec)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchApiSpec()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentação da API...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header customizado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📚</div>
            <div>
              <h1 className="text-3xl font-bold">Documentação da API</h1>
              <p className="text-blue-100 mt-2">
                Galáxia das Profissões - Explore todas as funcionalidades disponíveis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Base URL: <code className="bg-gray-200 px-1 rounded">/api</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🔐</span>
              <span>Autenticação: JWT Bearer Token</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">📊</span>
              <span>Formato: JSON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="api-docs-container">
        {spec && (
          <SwaggerUI 
            spec={spec} 
            docExpansion="tag"
            defaultModelsExpandDepth={2}
            tryItOutEnabled={true}
            filter={true}
            requestInterceptor={(request) => {
              // Adicionar token de autenticação se existir
              const token = localStorage.getItem('token')
              if (token) {
                request.headers.Authorization = `Bearer ${token}`
              }
              return request
            }}
          />
        )}
      </div>

      <style jsx global>{`
        .api-docs-container .swagger-ui {
          font-family: inherit;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .swagger-ui .info .title {
          color: #1f2937;
        }
        
        .swagger-ui .opblock.opblock-get {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .swagger-ui .opblock.opblock-post {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .swagger-ui .opblock.opblock-put {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .swagger-ui .btn.authorize {
          background-color: #7c3aed;
          border-color: #7c3aed;
        }
        
        .swagger-ui .btn.authorize:hover {
          background-color: #6d28d9;
          border-color: #6d28d9;
        }
      `}</style>
    </div>
  )
}