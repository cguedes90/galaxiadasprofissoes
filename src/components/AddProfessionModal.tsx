'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AddProfessionModalProps {
  onClose: () => void
  onSubmit: (professionData: any) => void
}

export default function AddProfessionModal({ onClose, onSubmit }: AddProfessionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
    required_education: '',
    salary_min: '',
    salary_max: '',
    formation_time: '',
    main_activities: '',
    certifications: '',
    related_professions: '',
    icon_color: '#00d4aa'
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const areas = [
    'Tecnologia', 'Saúde', 'Design', 'Educação', 'Engenharia', 
    'Administração', 'Direito', 'Arte', 'Ciências', 'Comunicação',
    'Psicologia', 'Arquitetura', 'Finanças', 'Marketing', 'Gastronomia'
  ]

  const colors = [
    '#00d4aa', '#ff6b6b', '#9c88ff', '#4ecdc4', '#45b7d1',
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ]

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
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória'
    if (!formData.area.trim()) newErrors.area = 'Área é obrigatória'
    if (!formData.required_education.trim()) newErrors.required_education = 'Formação é obrigatória'
    
    if (formData.salary_min && formData.salary_max) {
      const min = parseInt(formData.salary_min)
      const max = parseInt(formData.salary_max)
      if (min >= max) {
        newErrors.salary_max = 'Salário máximo deve ser maior que o mínimo'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const professionData = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : 0,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : 0,
      main_activities: formData.main_activities ? formData.main_activities.split(',').map(item => item.trim()) : [],
      certifications: formData.certifications ? formData.certifications.split(',').map(item => item.trim()) : [],
      related_professions: formData.related_professions ? formData.related_professions.split(',').map(item => item.trim()) : [],
      x_position: Math.random() * 400 - 200, // Posição aleatória
      y_position: Math.random() * 400 - 200
    }

    onSubmit(professionData)
  }

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
        className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-100 to-blue-100">
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: formData.icon_color }}
            />
            <h2 className="text-2xl font-bold text-gray-800">
              Incluir Nova Profissão
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Profissão *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ex: Desenvolvedor Full Stack"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área *
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Selecione uma área</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Descreva o que faz este profissional..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formação Necessária *
            </label>
            <input
              type="text"
              name="required_education"
              value={formData.required_education}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.required_education ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ex: Ensino Superior em Ciência da Computação"
            />
            {errors.required_education && <p className="text-red-500 text-xs mt-1">{errors.required_education}</p>}
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário Mínimo (R$)
              </label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário Máximo (R$)
              </label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.salary_max ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="15000"
              />
              {errors.salary_max && <p className="text-red-500 text-xs mt-1">{errors.salary_max}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Formação
              </label>
              <input
                type="text"
                name="formation_time"
                value={formData.formation_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4 anos"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principais Atividades
            </label>
            <textarea
              name="main_activities"
              value={formData.main_activities}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separe as atividades por vírgula: Programação, Testes, Documentação"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificações
            </label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separe por vírgula: AWS, Google Cloud, Microsoft Azure"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profissões Relacionadas
            </label>
            <input
              type="text"
              name="related_professions"
              value={formData.related_professions}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Separe por vírgula: Front-end, Back-end, DevOps"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor da Estrela
            </label>
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon_color: color }))}
                  className={`w-8 h-8 rounded-full border-2 ${formData.icon_color === color ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Enviar Proposta
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}