'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ContactModalProps {
  onClose: () => void
}

export default function ContactModal({ onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Assunto é obrigatório'
    if (!formData.message.trim()) newErrors.message = 'Mensagem é obrigatória'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        // Limpar formulário
        setFormData({ name: '', email: '', subject: '', message: '' })
        // Fechar modal após 2 segundos
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const subjectOptions = [
    'Sugestão de Nova Profissão',
    'Problema Técnico',
    'Parceria/Colaboração',
    'Feedback Geral',
    'Dúvida sobre Profissões',
    'Outro'
  ]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-100 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              📧
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Entre em Contato
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ Mensagem enviada com sucesso! Entraremos em contato em breve.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ❌ Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente.
            </div>
          )}

          {/* Nome e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Seu nome completo"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto *
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione um assunto</option>
              {subjectOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descreva sua mensagem detalhadamente..."
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>

          {/* Info de contato direto */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            📧 <strong>Contato direto:</strong> contato@inovamentelabs.com.br
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  📧 Enviar Mensagem
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}