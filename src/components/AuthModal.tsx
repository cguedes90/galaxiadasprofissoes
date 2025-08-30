'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoginCredentials, RegisterData } from '@/types/user'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: LoginCredentials) => Promise<void>
  onRegister: (data: RegisterData) => Promise<void>
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
    education: {
      level: '' as any,
      status: '' as any
    },
    agreeTerms: false,
    agreeNewsletter: false
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

    // Enhanced client-side validation
    const validationError = validateRegistrationForm(registerForm)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const registrationData: RegisterData = {
        name: registerForm.name.trim(),
        email: registerForm.email.toLowerCase().trim(),
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        dateOfBirth: registerForm.dateOfBirth ? new Date(registerForm.dateOfBirth) : null,
        education: registerForm.education.level ? {
          level: registerForm.education.level,
          status: registerForm.education.status
        } : undefined,
        agreeTerms: registerForm.agreeTerms,
        agreeNewsletter: registerForm.agreeNewsletter
      }
      
      await onRegister(registrationData)
      onClose()
    } catch (err: any) {
      // Handle specific API errors
      if (err.field) {
        setError(`${err.message} (${err.field})`)
      } else {
        setError(err.message || 'Erro no cadastro')
      }
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
      education: {
        level: '',
        status: ''
      },
      agreeTerms: false,
      agreeNewsletter: false
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

  // Client-side validation function
  const validateRegistrationForm = (form: typeof registerForm): string | null => {
    if (!form.name.trim()) return 'Nome é obrigatório'
    if (form.name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
    
    if (!form.email.trim()) return 'Email é obrigatório'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) return 'Email deve ter um formato válido'
    
    if (!form.password) return 'Senha é obrigatória'
    if (form.password.length < 8) return 'Senha deve ter pelo menos 8 caracteres'
    
    // Password strength check
    const hasLowerCase = /[a-z]/.test(form.password)
    const hasUpperCase = /[A-Z]/.test(form.password)
    const hasNumbers = /\d/.test(form.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
    const strengthCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    
    if (strengthCount < 2) {
      return 'Senha deve conter pelo menos 2 tipos: minúsculas, maiúsculas, números ou símbolos'
    }
    
    if (form.password !== form.confirmPassword) return 'Senhas não conferem'
    
    if (!form.dateOfBirth) return 'Data de nascimento é obrigatória'
    
    // Age validation
    const birthDate = new Date(form.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    if (age < 13) return 'Você deve ter pelo menos 13 anos para se cadastrar'
    if (birthDate > today) return 'Data de nascimento não pode ser no futuro'
    
    if (!form.agreeTerms) return 'Você deve aceitar os termos de uso'
    
    // Education validation (if provided)
    if (form.education.level && !form.education.status) {
      return 'Se você informou o nível de educação, deve informar também o status'
    }
    
    return null
  }

  if (!isOpen) return null

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
                  max={new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Máximo: 13 anos atrás
                  min={new Date(Date.now() - 120 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Mínimo: 120 anos atrás
                />
              </div>
              
              {/* Education Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Informações Educacionais (Opcional)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Educação
                  </label>
                  <select
                    value={registerForm.education.level}
                    onChange={(e) => setRegisterForm({ 
                      ...registerForm, 
                      education: { ...registerForm.education, level: e.target.value as any } 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione seu nível</option>
                    <option value="ensino_fundamental">Ensino Fundamental</option>
                    <option value="ensino_medio">Ensino Médio</option>
                    <option value="ensino_tecnico">Ensino Técnico</option>
                    <option value="ensino_superior">Ensino Superior</option>
                    <option value="pos_graduacao">Pós-graduação</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                  </select>
                </div>
                
                {registerForm.education.level && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={registerForm.education.status}
                      onChange={(e) => setRegisterForm({ 
                        ...registerForm, 
                        education: { ...registerForm.education, status: e.target.value as any } 
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione o status</option>
                      <option value="estudando">Estudando</option>
                      <option value="concluido">Concluído</option>
                      <option value="interrompido">Interrompido</option>
                      <option value="pretendo_cursar">Pretendo Cursar</option>
                    </select>
                  </div>
                )}
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

              {/* Terms and Newsletter */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    required
                    checked={registerForm.agreeTerms}
                    onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                    Aceito os{' '}
                    <a href="/termos" target="_blank" className="text-blue-600 hover:underline">
                      termos de uso
                    </a>{' '}
                    e{' '}
                    <a href="/privacidade" target="_blank" className="text-blue-600 hover:underline">
                      política de privacidade
                    </a>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeNewsletter"
                    checked={registerForm.agreeNewsletter}
                    onChange={(e) => setRegisterForm({ ...registerForm, agreeNewsletter: e.target.checked })}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeNewsletter" className="text-sm text-gray-600">
                    Quero receber novidades e dicas sobre carreiras por email (opcional)
                  </label>
                </div>
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