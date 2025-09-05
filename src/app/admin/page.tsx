'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface SuggestedProfession {
  id: number
  name: string
  description: string
  area: string
  required_education: string
  salary_min: number
  salary_max: number
  formation_time: string
  main_activities: string[]
  certifications: string[]
  related_professions: string[]
  icon_color: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [suggestedProfessions, setSuggestedProfessions] = useState<SuggestedProfession[]>([])
  const [stats, setStats] = useState<{ pending?: number, approved?: number, rejected?: number }>({})
  const [selectedProfession, setSelectedProfession] = useState<SuggestedProfession | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SuggestedProfession>>({})

  useEffect(() => {
    checkAuthToken()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuggestedProfessions()
    }
  }, [isAuthenticated])

  const checkAuthToken = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setAdmin(result.data.admin)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('adminToken')
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      localStorage.removeItem('adminToken')
    }

    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.setItem('adminToken', result.data.token)
        setAdmin(result.data.admin)
        setIsAuthenticated(true)
        setLoginForm({ username: '', password: '' })
      } else {
        setLoginError(result.error?.message || 'Erro no login')
      }
    } catch (error) {
      setLoginError('Erro de conexão')
    }
  }

  const fetchSuggestedProfessions = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/suggested-professions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setSuggestedProfessions(result.data)
        setStats(result.meta.stats || {})
      }
    } catch (error) {
      console.error('Erro ao buscar profissões sugeridas:', error)
    }
  }

  const handleEdit = (profession: SuggestedProfession) => {
    setSelectedProfession(profession)
    setEditForm({ ...profession })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedProfession || !editForm.name || !editForm.description) {
      alert('Nome e descrição são obrigatórios')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/suggested-professions?id=${selectedProfession.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'edit',
          data: editForm
        })
      })

      if (response.ok) {
        setIsEditing(false)
        setSelectedProfession(null)
        setEditForm({})
        fetchSuggestedProfessions()
        alert('Profissão editada com sucesso!')
      } else {
        alert('Erro ao editar profissão')
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  const handleApprove = async (profession: SuggestedProfession) => {
    if (!confirm(`Aprovar a profissão "${profession.name}"? Ela será adicionada à galáxia.`)) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/suggested-professions?id=${profession.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      })

      if (response.ok) {
        alert('Profissão aprovada e adicionada à galáxia! ✨')
        fetchSuggestedProfessions()
      } else {
        alert('Erro ao aprovar profissão')
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  const handleReject = async (profession: SuggestedProfession) => {
    if (!confirm(`Rejeitar a profissão "${profession.name}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/suggested-professions?id=${profession.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      })

      if (response.ok) {
        alert('Profissão rejeitada')
        fetchSuggestedProfessions()
      } else {
        alert('Erro ao rejeitar profissão')
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    setAdmin(null)
    setSuggestedProfessions([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">🌌 Admin Galáxia</h1>
            <p className="text-gray-600">Painel Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm">{loginError}</div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="bg-black bg-opacity-20 backdrop-blur-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🌌 Admin Galáxia das Profissões</h1>
            <p className="text-gray-300">Bem-vindo, {admin?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.pending || 0}</div>
            <div className="text-yellow-200">Pendentes</div>
          </div>
          <div className="bg-green-500 bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.approved || 0}</div>
            <div className="text-green-200">Aprovadas</div>
          </div>
          <div className="bg-red-500 bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.rejected || 0}</div>
            <div className="text-red-200">Rejeitadas</div>
          </div>
        </div>

        {/* Professions List */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Profissões Sugeridas</h2>
          
          {suggestedProfessions.length === 0 ? (
            <div className="text-gray-300 text-center py-8">
              Nenhuma profissão sugerida encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {suggestedProfessions.map((profession) => (
                <div
                  key={profession.id}
                  className={`bg-white bg-opacity-10 rounded-lg p-4 border ${
                    profession.status === 'pending' ? 'border-yellow-500' :
                    profession.status === 'approved' ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{profession.name}</h3>
                      <p className="text-gray-300 text-sm mb-2">{profession.area}</p>
                      <p className="text-gray-200">{profession.description}</p>
                      
                      {profession.salary_min > 0 && (
                        <p className="text-green-300 text-sm mt-1">
                          💰 R$ {profession.salary_min.toLocaleString()} - R$ {profession.salary_max.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div
                      className="w-6 h-6 rounded-full ml-4"
                      style={{ backgroundColor: profession.icon_color }}
                    />
                  </div>

                  {profession.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(profession)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleApprove(profession)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        ✅ Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(profession)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  )}

                  {profession.status !== 'pending' && (
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        profession.status === 'approved' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {profession.status === 'approved' ? '✅ Aprovada' : '❌ Rejeitada'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedProfession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Editar Profissão</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área
                  </label>
                  <input
                    type="text"
                    value={editForm.area || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formação
                  </label>
                  <input
                    type="text"
                    value={editForm.required_education || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, required_education: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salário Mín (R$)
                  </label>
                  <input
                    type="number"
                    value={editForm.salary_min || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, salary_min: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salário Máx (R$)
                  </label>
                  <input
                    type="number"
                    value={editForm.salary_max || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, salary_max: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSelectedProfession(null)
                  setEditForm({})
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}