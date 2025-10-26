
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {Check, X, Star, Zap, Crown, ArrowRight} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import AuthModal from '../components/AuthModal'

export const Pricing: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const { isAuthenticated } = useAuth()

  const plans = [
    {
      name: 'Básico',
      icon: <Star className="w-8 h-8 text-blue-600" />,
      description: 'Ideal para pequenas propriedades',
      monthlyPrice: 89,
      annualPrice: 890,
      savings: 180,
      features: [
        'Até 100 animais',
        'Gestão básica de rebanho',
        'Controle financeiro simples',
        '2 pastagens',
        'Relatórios básicos',
        'Suporte por email'
      ],
      limitations: [
        'Sem auditoria avançada',
        'Sem simulador de rentabilidade',
        'Sem integração com terceiros'
      ],
      recommended: false,
      color: 'blue'
    },
    {
      name: 'Profissional',
      icon: <Zap className="w-8 h-8 text-green-600" />,
      description: 'Para propriedades em crescimento',
      monthlyPrice: 189,
      annualPrice: 1890,
      savings: 378,
      features: [
        'Até 500 animais',
        'Gestão completa de rebanho',
        'Controle financeiro avançado',
        'Pastagens ilimitadas',
        'Todos os relatórios',
        'Simulador de rentabilidade',
        'Sistema de auditoria',
        'Suporte prioritário',
        'Backup automático'
      ],
      limitations: [
        'Sem múltiplos usuários',
        'Sem API personalizada'
      ],
      recommended: true,
      color: 'green'
    },
    {
      name: 'Enterprise',
      icon: <Crown className="w-8 h-8 text-purple-600" />,
      description: 'Para grandes operações',
      monthlyPrice: 389,
      annualPrice: 3890,
      savings: 778,
      features: [
        'Animais ilimitados',
        'Múltiplos usuários',
        'Gestão multi-propriedades',
        'API completa',
        'Integração com terceiros',
        'Relatórios personalizados',
        'Consultoria especializada',
        'Suporte 24/7',
        'Treinamento da equipe',
        'Implementação assistida'
      ],
      limitations: [],
      recommended: false,
      color: 'purple'
    }
  ]

  const handleSubscribe = (planName: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    // Lógica de assinatura aqui
    console.log(`Subscribing to ${planName}`)
  }

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  }

  const getColorClasses = (color: string, recommended: boolean) => {
    const baseClasses = {
      blue: {
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        accent: 'text-blue-600'
      },
      green: {
        border: 'border-green-200 ring-2 ring-green-500',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        accent: 'text-green-600'
      },
      purple: {
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        accent: 'text-purple-600'
      }
    }
    return baseClasses[color as keyof typeof baseClasses]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Planos que crescem com seu negócio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Escolha o plano ideal para sua propriedade. Todos incluem teste gratuito de 30 dias
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingCycle === 'annual' && (
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                Economize até 20%
              </span>
            )}
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const colorClasses = getColorClasses(plan.color, plan.recommended)
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${colorClasses.border} ${
                  plan.recommended ? 'transform scale-105' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {getPrice(plan).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-gray-600">
                      /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>

                  {billingCycle === 'annual' && plan.savings > 0 && (
                    <p className="text-green-600 text-sm font-semibold">
                      Economize R$ {plan.savings} por ano
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center mb-8 ${colorClasses.button}`}
                >
                  {isAuthenticated ? 'Assinar Agora' : 'Começar Teste Gratuito'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Incluso:</h4>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Não incluso:</h4>
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-center">
                          <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Perguntas Frequentes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Os dados ficam seguros?
              </h3>
              <p className="text-gray-600">
                Todos os dados são criptografados e armazenados com backup automático diário.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Preciso de treinamento?
              </h3>
              <p className="text-gray-600">
                Oferecemos treinamento completo e suporte técnico para todos os planos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso mudar de plano?
              </h3>
              <p className="text-gray-600">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

  
    </div>
  )
}

export default Pricing
