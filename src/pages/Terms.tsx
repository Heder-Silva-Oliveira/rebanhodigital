
import React from 'react'
import { motion } from 'framer-motion'
import {Shield, FileText, Scale, AlertTriangle} from 'lucide-react'

export const Terms: React.FC = () => {
  const sections = [
    {
      id: 'aceite',
      title: '1. Aceite dos Termos',
      content: [
        'Ao acessar e usar a plataforma AgroPec Manager, você concorda em cumprir e estar sujeito aos seguintes termos e condições de uso.',
        'Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.',
        'Reservamo-nos o direito de alterar estes termos a qualquer momento, sendo sua responsabilidade verificar periodicamente as atualizações.'
      ]
    },
    {
      id: 'servicos',
      title: '2. Descrição dos Serviços',
      content: [
        'A AgroPec Manager oferece uma plataforma digital para gestão de propriedades pecuárias, incluindo controle de rebanho, gestão financeira, monitoramento de pastagens e geração de relatórios.',
        'Nossos serviços são fornecidos "como estão" e podem ser modificados, suspensos ou descontinuados a qualquer momento.',
        'Não garantimos que os serviços estarão sempre disponíveis, livres de erros ou que atenderão às suas necessidades específicas.'
      ]
    },
    {
      id: 'conta',
      title: '3. Conta de Usuário',
      content: [
        'Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas e atualizadas.',
        'Você é responsável por manter a confidencialidade de suas credenciais de acesso.',
        'Você deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.',
        'Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.'
      ]
    },
    {
      id: 'uso-aceitavel',
      title: '4. Uso Aceitável',
      content: [
        'Você concorda em usar nossos serviços apenas para fins legais e de acordo com estes termos.',
        'É proibido usar a plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros.',
        'Não é permitido tentar acessar sistemas ou dados não autorizados.',
        'O compartilhamento de credenciais de acesso é estritamente proibido.'
      ]
    },
    {
      id: 'dados',
      title: '5. Proteção de Dados',
      content: [
        'Coletamos e processamos seus dados pessoais de acordo com nossa Política de Privacidade.',
        'Você mantém a propriedade de todos os dados inseridos na plataforma.',
        'Implementamos medidas de segurança adequadas para proteger seus dados.',
        'Você pode solicitar a exportação ou exclusão de seus dados a qualquer momento.'
      ]
    },
    {
      id: 'pagamento',
      title: '6. Pagamento e Assinatura',
      content: [
        'O acesso aos serviços está sujeito ao pagamento das taxas aplicáveis conforme o plano escolhido.',
        'Os pagamentos são processados através de provedores terceirizados seguros.',
        'As taxas são cobradas antecipadamente e não são reembolsáveis, exceto quando exigido por lei.',
        'Você pode cancelar sua assinatura a qualquer momento através da plataforma.'
      ]
    },
    {
      id: 'propriedade',
      title: '7. Propriedade Intelectual',
      content: [
        'Todos os direitos de propriedade intelectual da plataforma pertencem à AgroPec Manager.',
        'Você recebe uma licença limitada e não exclusiva para usar nossos serviços.',
        'É proibido copiar, modificar, distribuir ou criar obras derivadas de nossos conteúdos.',
        'Respeitamos os direitos de propriedade intelectual de terceiros e esperamos que você faça o mesmo.'
      ]
    },
    {
      id: 'limitacao',
      title: '8. Limitação de Responsabilidade',
      content: [
        'Nossa responsabilidade é limitada ao valor pago pelos serviços nos últimos 12 meses.',
        'Não somos responsáveis por danos indiretos, incidentais ou consequenciais.',
        'Você usa nossos serviços por sua própria conta e risco.',
        'Recomendamos manter backups independentes de seus dados importantes.'
      ]
    },
    {
      id: 'rescisao',
      title: '9. Rescisão',
      content: [
        'Você pode encerrar sua conta a qualquer momento através das configurações da plataforma.',
        'Podemos suspender ou encerrar sua conta em caso de violação destes termos.',
        'Após o encerramento, você perderá o acesso aos serviços e dados na plataforma.',
        'As disposições que por sua natureza devem sobreviver continuarão válidas após a rescisão.'
      ]
    },
    {
      id: 'geral',
      title: '10. Disposições Gerais',
      content: [
        'Estes termos são regidos pelas leis brasileiras.',
        'Qualquer disputa será resolvida nos tribunais de São Paulo, SP.',
        'Se alguma disposição for considerada inválida, as demais permanecerão em vigor.',
        'Estes termos constituem o acordo completo entre as partes.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Termos de Uso
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leia atentamente nossos termos e condições de uso da plataforma AgroPec Manager
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Última atualização: 15 de janeiro de 2024
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-start space-x-3"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">
                Aviso Importante
              </h3>
              <p className="text-yellow-700 text-sm">
                Ao usar nossa plataforma, você automaticamente concorda com estes termos. 
                É importante ler e compreender todas as cláusulas antes de prosseguir.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8"
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

      {/* Legal Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Proteção Legal
              </h3>
              <p className="text-gray-600">
                Nossos termos estão em conformidade com a legislação brasileira
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Transparência
              </h3>
              <p className="text-gray-600">
                Linguagem clara e objetiva para seu entendimento
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Atualizações
              </h3>
              <p className="text-gray-600">
                Termos revisados periodicamente para sua proteção
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Dúvidas sobre os Termos?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Nossa equipe está disponível para esclarecer qualquer questão
            </p>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Email:</strong> legal@agropecmanager.com.br
              </p>
              <p>
                <strong>Telefone:</strong> +55 (11) 3000-0000
              </p>
              <p>
                <strong>Endereço:</strong> Rua das Tecnologias, 123 - São Paulo, SP
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Terms
