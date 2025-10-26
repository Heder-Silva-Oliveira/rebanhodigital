
import React from 'react'
import { motion } from 'framer-motion'
import {Shield, Lock, Eye, Database, UserCheck, AlertCircle} from 'lucide-react'

export const Privacy: React.FC = () => {
  const sections = [
    {
      id: 'introducao',
      title: '1. Introdução',
      content: [
        'A AgroPec Manager está comprometida com a proteção da privacidade e segurança dos dados pessoais de nossos usuários.',
        'Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais.',
        'Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018 e outras regulamentações aplicáveis.'
      ]
    },
    {
      id: 'dados-coletados',
      title: '2. Dados Coletados',
      content: [
        'Dados de identificação: nome, email, telefone, CPF/CNPJ quando necessário.',
        'Dados da propriedade: informações sobre animais, pastagens, transações financeiras e operações.',
        'Dados de uso: logs de acesso, endereço IP, tipo de dispositivo e navegador.',
        'Dados de comunicação: mensagens enviadas através de nossos canais de suporte.'
      ]
    },
    {
      id: 'finalidade',
      title: '3. Finalidade do Tratamento',
      content: [
        'Prestação dos serviços de gestão pecuária através da plataforma.',
        'Comunicação com usuários sobre atualizações, suporte e questões relacionadas aos serviços.',
        'Melhoria contínua da plataforma através de análises de uso e feedback.',
        'Cumprimento de obrigações legais e regulamentares aplicáveis.'
      ]
    },
    {
      id: 'base-legal',
      title: '4. Base Legal',
      content: [
        'Execução de contrato: para prestação dos serviços contratados.',
        'Consentimento: para comunicações de marketing e funcionalidades opcionais.',
        'Legítimo interesse: para melhoria dos serviços e segurança da plataforma.',
        'Cumprimento de obrigação legal: quando exigido por lei ou autoridades competentes.'
      ]
    },
    {
      id: 'compartilhamento',
      title: '5. Compartilhamento de Dados',
      content: [
        'Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.',
        'Podemos compartilhar dados com prestadores de serviços essenciais (hospedagem, pagamento, suporte).',
        'Compartilhamento pode ocorrer quando exigido por lei ou ordem judicial.',
        'Todos os terceiros são contratualmente obrigados a proteger seus dados.'
      ]
    },
    {
      id: 'seguranca',
      title: '6. Segurança dos Dados',
      content: [
        'Utilizamos criptografia SSL/TLS para proteger dados em trânsito.',
        'Dados são armazenados em servidores seguros com controle de acesso restrito.',
        'Realizamos backups regulares e testes de segurança.',
        'Equipe treinada em boas práticas de segurança da informação.'
      ]
    },
    {
      id: 'retencao',
      title: '7. Retenção de Dados',
      content: [
        'Dados são mantidos apenas pelo tempo necessário para cumprir as finalidades descritas.',
        'Dados de conta ativa são mantidos enquanto o serviço estiver sendo utilizado.',
        'Após cancelamento, dados podem ser mantidos por período adicional para fins legais.',
        'Dados podem ser anonimizados para análises estatísticas e melhorias do serviço.'
      ]
    },
    {
      id: 'direitos',
      title: '8. Seus Direitos',
      content: [
        'Acesso: solicitar informações sobre o tratamento de seus dados.',
        'Correção: solicitar correção de dados incompletos, inexatos ou desatualizados.',
        'Exclusão: solicitar eliminação de dados desnecessários ou tratados inadequadamente.',
        'Portabilidade: solicitar transferência de dados para outro prestador de serviços.'
      ]
    },
    {
      id: 'cookies',
      title: '9. Cookies e Tecnologias Similares',
      content: [
        'Utilizamos cookies essenciais para funcionamento da plataforma.',
        'Cookies de performance para análise de uso e melhorias.',
        'Você pode configurar seu navegador para bloquear cookies não essenciais.',
        'Alguns recursos podem não funcionar adequadamente sem cookies.'
      ]
    },
    {
      id: 'menores',
      title: '10. Proteção de Menores',
      content: [
        'Nossos serviços são destinados a pessoas maiores de 18 anos.',
        'Não coletamos intencionalmente dados de menores de idade.',
        'Se tomarmos conhecimento de coleta inadvertida, os dados serão excluídos.',
        'Responsáveis legais podem exercer direitos em nome de menores.'
      ]
    },
    {
      id: 'atualizacoes',
      title: '11. Atualizações da Política',
      content: [
        'Esta política pode ser atualizada periodicamente.',
        'Usuários serão notificados sobre mudanças significativas.',
        'Continuação do uso implica aceitação das alterações.',
        'Versão anterior será mantida disponível para consulta.'
      ]
    }
  ]

  const principles = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Transparência',
      description: 'Informações claras sobre como tratamos seus dados'
    },
    {
      icon: <Lock className="w-8 h-8 text-green-600" />,
      title: 'Segurança',
      description: 'Proteção robusta contra acessos não autorizados'
    },
    {
      icon: <Eye className="w-8 h-8 text-purple-600" />,
      title: 'Controle',
      description: 'Você tem controle total sobre seus dados pessoais'
    },
    {
      icon: <UserCheck className="w-8 h-8 text-orange-600" />,
      title: 'Consentimento',
      description: 'Tratamento baseado em consentimento livre e informado'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Política de Privacidade
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seu compromisso com a proteção e privacidade dos seus dados na plataforma AgroPec Manager
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Última atualização: 15 de janeiro de 2024 | Em conformidade com a LGPD
            </div>
          </motion.div>
        </div>
      </section>

      {/* LGPD Compliance Notice */}
      <section className="py-8 bg-blue-50 border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-start space-x-3"
          >
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">
                Conformidade com a LGPD
              </h3>
              <p className="text-blue-700 text-sm">
                Esta política está em total conformidade com a Lei Geral de Proteção de Dados (LGPD) 
                e garante seus direitos como titular de dados pessoais.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossos Princípios de Privacidade
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fundamentamos nosso tratamento de dados em princípios sólidos de proteção e transparência
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {principle.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {principle.title}
                </h3>
                <p className="text-gray-600">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection Officer */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8"
          >
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Encarregado de Proteção de Dados (DPO)
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Nosso DPO está disponível para esclarecer dúvidas sobre o tratamento de dados 
                e auxiliar no exercício de seus direitos.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">dpo@agropecmanager.com.br</p>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
                  <p className="text-gray-600">+55 (11) 3000-0000</p>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Horário</h3>
                  <p className="text-gray-600">Seg a Sex, 9h às 17h</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rights Exercise */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exercite Seus Direitos
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Você tem direitos garantidos pela LGPD. Entre em contato conosco para exercê-los
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Solicitar Dados
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                Exercer Direitos
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              Responderemos sua solicitação em até 15 dias úteis
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Privacy
