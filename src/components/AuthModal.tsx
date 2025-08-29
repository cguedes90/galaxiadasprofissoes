'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: { email: string; password: string }) => Promise<void>
  onRegister: (data: any) => Promise<void>
}

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Registration form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    agreeTerms: false
  })

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin({
        email: loginForm.email,
        password: loginForm.password
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro no login')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic client-side validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Senhas não conferem')
      setLoading(false)
      return
    }

    if (registerForm.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres')
      setLoading(false)
      return
    }

    if (!registerForm.agreeTerms) {
      setError('Você deve aceitar os termos de uso')
      setLoading(false)
      return
    }

    try {
      await onRegister({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        dateOfBirth: registerForm.dateOfBirth,
        agreeTerms: registerForm.agreeTerms
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro no cadastro')
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setLoginForm({ email: '', password: '' })
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      agreeTerms: false
    })
    setError('')
    setShowLoginPassword(false)
    setShowRegisterPassword(false)
    setShowConfirmPassword(false)
  }

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    resetForms()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </h2>
            <button
              onClick={() => {
                onClose()
                resetForms()
              }}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  required
                  value={registerForm.dateOfBirth}
                  onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showRegisterPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  required
                  checked={registerForm.agreeTerms}
                  onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })}
                  className="mt-1 mr-3"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                  Aceito os termos de uso e política de privacidade
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center border-t pt-4">
            {mode === 'login' ? (
              <p className="text-gray-600">
                Ainda não tem uma conta?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}