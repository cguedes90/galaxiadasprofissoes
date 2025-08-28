'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RegisterData, LoginCredentials, EducationInfo } from '@/types/user'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: LoginCredentials) => void
  onRegister: (data: RegisterData) => void
}

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>('login')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Login form
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  })

  // Registration form
  const [registerForm, setRegisterForm] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: null,
    education: {
      level: 'ensino_medio',
      status: 'concluido'
    },
    agreeTerms: false,
    agreeNewsletter: false
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  if (!isOpen) return null

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: {[key: string]: string} = {}

    if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!loginForm.password) {
      newErrors.password = 'Senha é obrigatória'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      await onLogin(loginForm)
      onClose()
    } catch (error) {
      setErrors({ general: 'Email ou senha incorretos' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: {[key: string]: string} = {}

    if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!validatePassword(registerForm.password)) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres'
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem'
    }

    if (!registerForm.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStep(2)
    setErrors({})
  }

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const newErrors: {[key: string]: string} = {}

    if (!registerForm.dateOfBirth) {
      newErrors.dateOfBirth = 'Data de nascimento é obrigatória'
    } else {
      const age = new Date().getFullYear() - registerForm.dateOfBirth.getFullYear()
      if (age < 13) {
        newErrors.dateOfBirth = 'Você deve ter pelo menos 13 anos'
      }
    }

    if (!registerForm.agreeTerms) {
      newErrors.agreeTerms = 'Você deve aceitar os termos de uso'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      await onRegister(registerForm)
      onClose()
    } catch (error) {
      setErrors({ general: 'Erro no cadastro. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const educationLevels = [
    { value: 'ensino_fundamental', label: 'Ensino Fundamental' },
    { value: 'ensino_medio', label: 'Ensino Médio' },
    { value: 'ensino_tecnico', label: 'Ensino Técnico' },
    { value: 'ensino_superior', label: 'Ensino Superior' },
    { value: 'pos_graduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' }
  ]

  const educationStatus = [
    { value: 'estudando', label: 'Estudando atualmente' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'interrompido', label: 'Interrompido' },
    { value: 'pretendo_cursar', label: 'Pretendo cursar' }
  ]

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
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'login' ? 'Entrar' : 'Criar Conta'}
              </h2>
              {mode === 'register' && (
                <p className="text-blue-100 text-sm mt-1">
                  Passo {step} de 2
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {errors.general}
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
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Sua senha"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={loginForm.rememberMe}
                    onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Lembrar de mim
                  </label>
                </div>
                <a 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={onClose}
                >
                  Esqueceu a senha?
                </a>
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

          {/* Register Form - Step 1 */}
          {mode === 'register' && step === 1 && (
            <form onSubmit={handleRegisterStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirme sua senha"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Continuar
              </button>
            </form>
          )}

          {/* Register Form - Step 2 */}
          {mode === 'register' && step === 2 && (
            <form onSubmit={handleRegisterStep2} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={registerForm.dateOfBirth ? registerForm.dateOfBirth.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const dateValue = new Date(e.target.value)
                      // Verificar se a data é válida
                      if (!isNaN(dateValue.getTime())) {
                        setRegisterForm({ 
                          ...registerForm, 
                          dateOfBirth: dateValue
                        })
                      }
                    } else {
                      setRegisterForm({ 
                        ...registerForm, 
                        dateOfBirth: null
                      })
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolaridade
                </label>
                <select
                  value={registerForm.education.level}
                  onChange={(e) => setRegisterForm({ 
                    ...registerForm, 
                    education: { 
                      ...registerForm.education, 
                      level: e.target.value as EducationInfo['currentLevel']
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {educationLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={registerForm.education.status}
                  onChange={(e) => setRegisterForm({ 
                    ...registerForm, 
                    education: { 
                      ...registerForm.education, 
                      status: e.target.value as EducationInfo['status']
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {educationStatus.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={registerForm.agreeTerms}
                    onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                    Aceito os <a href="/termos" className="text-blue-600 hover:underline">Termos de Uso</a> e 
                    a <a href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</a>
                  </label>
                </div>
                {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeNewsletter"
                    checked={registerForm.agreeNewsletter}
                    onChange={(e) => setRegisterForm({ ...registerForm, agreeNewsletter: e.target.checked })}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="agreeNewsletter" className="text-sm text-gray-600">
                    Quero receber dicas de carreira e novidades por email (opcional)
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar Conta'}
                </button>
              </div>
            </form>
          )}

          {/* Switch Mode */}
          <div className="mt-6 text-center border-t pt-4">
            {mode === 'login' ? (
              <p className="text-gray-600">
                Ainda não tem uma conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <button
                  onClick={() => {
                    setMode('login')
                    setStep(1)
                    setErrors({})
                  }}
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