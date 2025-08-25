'use client'

import { motion } from 'framer-motion'

interface FreePlanLimitModalProps {
  isOpen: boolean
  onClose: () => void
  remainingViews: number
  timeUntilReset: string
  isBlocked: boolean
  dailyLimit: number
}

export default function FreePlanLimitModal({ 
  isOpen, 
  onClose, 
  remainingViews, 
  timeUntilReset, 
  isBlocked,
  dailyLimit 
}: FreePlanLimitModalProps) {
  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
      >
        {/* Header */}
        <div className={`${isBlocked ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white p-6 rounded-t-xl`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {isBlocked ? '🔒 Limite Atingido' : '⏰ Plano Gratuito'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {isBlocked ? 'Aguarde para continuar explorando' : 'Visualizações limitadas'}
              </p>
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
          {isBlocked ? (
            // Quando está bloqueado
            <div className="text-center space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="font-semibold text-red-800 mb-2">
                  Limite diário atingido!
                </h3>
                <p className="text-red-600 text-sm">
                  Você visualizou suas {dailyLimit} profissões gratuitas de hoje.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    ⏰ {timeUntilReset}
                  </div>
                </div>
                <p className="text-blue-700 text-sm">
                  Tempo restante para o reset
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">
                  🚀 Quer explorar mais profissões?
                </h4>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>🎓 Plano Premium:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Acesso ilimitado a todas as profissões</li>
                      <li>Testes vocacionais avançados</li>
                      <li>Jornadas personalizadas</li>
                      <li>Sem limitações de tempo</li>
                    </ul>
                  </div>
                  <button className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors">
                    Upgrade para Premium 💎
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Quando ainda tem visualizações
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Plano Gratuito Ativo
                </h3>
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full font-bold">
                    {remainingViews} / {dailyLimit}
                  </div>
                  <span className="text-blue-600 text-sm">visualizações restantes</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>📋 Como funciona:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Você pode ver detalhes de <strong>3 profissões por dia</strong></li>
                  <li>O limite reseta a cada <strong>24 horas</strong></li>
                  <li>Profissões já vistas podem ser revisitadas</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  💡 Dica: Maximize suas visualizações
                </h4>
                <p className="text-sm text-gray-600">
                  Use o <strong>Teste Vocacional</strong> para descobrir quais profissões são mais compatíveis com você antes de usar suas visualizações!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {isBlocked ? 'Aguardar Reset' : 'Continuar Explorando'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}