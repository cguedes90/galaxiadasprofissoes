'use client'

import { motion } from 'framer-motion'
import { Profession } from '@/types/profession'

interface ProfessionModalProps {
  profession: Profession
  onClose: () => void
  onRelatedProfessionClick?: (professionName: string) => void
}

export default function ProfessionModal({ profession, onClose, onRelatedProfessionClick }: ProfessionModalProps) {
  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`
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
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ backgroundColor: `${profession.icon_color}20` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: profession.icon_color }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profession.name}
              </h2>
              <p className="text-gray-600">{profession.area}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Descrição
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {profession.description}
            </p>
          </section>

          {/* Key Info Grid */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💰 Salário</h4>
              <p className="text-blue-600">
                {formatSalary(profession.salary_min, profession.salary_max)}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎓 Formação</h4>
              <p className="text-green-600">{profession.formation_time}</p>
            </div>
          </section>

          {/* Education */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📚 Educação Necessária
            </h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              {profession.required_education}
            </p>
          </section>

          {/* Main Activities */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎯 Principais Atividades
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {profession.main_activities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </section>

          {/* Certifications */}
          {profession.certifications.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🏆 Certificações Importantes
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {profession.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Professions */}
          {profession.related_professions.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🔗 Profissões Relacionadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {profession.related_professions.map((related, index) => (
                  <button
                    key={index}
                    onClick={() => onRelatedProfessionClick?.(related)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 px-3 py-1 rounded-full text-sm transition-colors cursor-pointer transform hover:scale-105 duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    title={`Clique para ver detalhes de ${related}`}
                  >
                    {related}
                  </button>
                ))}
              </div>
              {onRelatedProfessionClick && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Clique nas profissões acima para explorar mais detalhes
                </p>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}