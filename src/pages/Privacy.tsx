import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react'

export const Privacy: React.FC = () => {
  const sections = [
    {
      id: 'introducao',
      title: '1. Introdução',
      content: [
        'A Rebanho Digital está comprometida com a proteção da privacidade e segurança dos dados pessoais de seus usuários.',
        'Esta Política de Privacidade descreve de forma clara como coletamos, utilizamos, armazenamos e protegemos os dados pessoais tratados por meio da plataforma.',
        'O tratamento de dados pessoais é realizado em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD) e demais normas aplicáveis.'
      ]
    },
    {
      id: 'controlador',
      title: '2. Controlador e Operadores de Dados',
      content: [
        'A Rebanho Digital atua como Controladora dos Dados Pessoais tratados na plataforma, sendo responsável pelas decisões referentes ao tratamento desses dados.',
        'Prestadores de serviços contratados para atividades como hospedagem, processamento de pagamentos, suporte técnico e comunicações atuam como Operadores de Dados.',
        'Todos os Operadores tratam os dados pessoais estritamente conforme nossas instruções e obrigações contratuais, em conformidade com a LGPD.'
      ]
    },
    {
      id: 'dados-coletados',
      title: '3. Dados Coletados',
      content: [
        'Dados de identificação: nome, endereço de e-mail, telefone e CPF ou CNPJ, quando necessário.',
        'Dados da propriedade rural: informações sobre rebanho, manejo, pastagens, registros operacionais e financeiros.',
        'Dados de uso da plataforma: logs de acesso, endereço IP, data e hora de acesso, tipo de dispositivo, navegador e sistema operacional.',
        'Dados de comunicação: informações fornecidas em contatos realizados por meio de nossos canais de atendimento.'
      ]
    },
    {
      id: 'dados-economicos',
      title: '4. Dados de Impacto Econômico',
      content: [
        'Alguns dados tratados pela plataforma, embora não classificados como dados sensíveis pela LGPD, possuem caráter estratégico e impacto econômico relevante.',
        'Esses dados incluem informações financeiras, produtivas e patrimoniais da atividade pecuária.',
        'Por essa razão, adotamos medidas técnicas e organizacionais reforçadas para garantir a confidencialidade e integridade dessas informações.'
      ]
    },
    {
      id: 'finalidade',
      title: '5. Finalidade do Tratamento',
      content: [
        'Disponibilizar e operacionalizar as funcionalidades da plataforma de gestão pecuária.',
        'Permitir o controle, organização e análise de informações inseridas pelo próprio usuário.',
        'Realizar comunicações relacionadas ao funcionamento da plataforma, suporte técnico e atualizações.',
        'Cumprir obrigações legais, regulatórias ou determinações de autoridades competentes.'
      ]
    },
    {
      id: 'base-legal',
      title: '6. Base Legal do Tratamento',
      content: [
        'Execução de contrato, para viabilizar a prestação dos serviços contratados.',
        'Consentimento do titular, quando exigido, especialmente para comunicações não essenciais.',
        'Legítimo interesse, para fins de segurança, prevenção a fraudes e melhoria da plataforma.',
        'Cumprimento de obrigação legal ou regulatória.'
      ]
    },
    {
      id: 'compartilhamento',
      title: '7. Compartilhamento de Dados',
      content: [
        'A Rebanho Digital não vende, aluga ou comercializa dados pessoais de seus usuários.',
        'Os dados podem ser compartilhados com prestadores de serviços essenciais à operação da plataforma.',
        'O compartilhamento também poderá ocorrer para cumprimento de obrigações legais ou ordens judiciais.',
        'Todos os terceiros envolvidos estão contratualmente obrigados a adotar medidas adequadas de proteção de dados.'
      ]
    },
    {
      id: 'transferencia',
      title: '8. Transferência Internacional de Dados',
      content: [
        'Os dados pessoais poderão ser armazenados ou processados em servidores localizados fora do território brasileiro.',
        'Nessas hipóteses, a Rebanho Digital assegura que a transferência ocorrerá em conformidade com a LGPD.',
        'Serão adotadas garantias adequadas de proteção, observando padrões de segurança e confidencialidade compatíveis com a legislação brasileira.'
      ]
    },
    {
      id: 'seguranca',
      title: '9. Segurança dos Dados',
      content: [
        'Utilizamos criptografia e protocolos de segurança para proteção dos dados em trânsito.',
        'Os dados são armazenados em ambientes controlados, com acesso restrito e monitorado.',
        'Realizamos rotinas de backup e medidas preventivas contra acessos não autorizados.',
        'Nossa equipe é treinada em boas práticas de segurança da informação e proteção de dados.'
      ]
    },
    {
      id: 'retencao',
      title: '10. Retenção de Dados',
      content: [
        'Os dados pessoais são mantidos apenas pelo tempo necessário para o cumprimento das finalidades descritas nesta política.',
        'Enquanto a conta estiver ativa, os dados permanecerão disponíveis ao usuário.',
        'Após o encerramento da conta, os dados poderão ser mantidos pelo período exigido por obrigações legais ou regulatórias.',
        'Sempre que possível, os dados poderão ser anonimizados para fins estatísticos e de melhoria da plataforma.'
      ]
    },
    {
      id: 'direitos',
      title: '11. Direitos do Titular',
      content: [
        'O titular pode solicitar confirmação da existência de tratamento de seus dados.',
        'É garantido o acesso, correção, atualização e portabilidade dos dados pessoais.',
        'O titular pode solicitar a exclusão de dados tratados de forma inadequada ou desnecessária.',
        'As solicitações serão atendidas no prazo legal de até 15 dias, conforme a LGPD.'
      ]
    },
    {
      id: 'cookies',
      title: '12. Cookies e Tecnologias Similares',
      content: [
        'Utilizamos cookies essenciais para o funcionamento adequado da plataforma.',
        'Cookies não essenciais somente serão utilizados mediante consentimento explícito do usuário.',
        'O usuário poderá gerenciar ou revogar seu consentimento a qualquer momento.',
        'A desativação de cookies pode impactar o funcionamento de determinadas funcionalidades.'
      ]
    },
    {
      id: 'menores',
      title: '13. Proteção de Menores',
      content: [
        'A plataforma é destinada exclusivamente a pessoas maiores de 18 anos.',
        'Não realizamos, de forma intencional, o tratamento de dados de menores de idade.',
        'Caso seja identificada a coleta inadvertida, os dados serão prontamente excluídos.'
      ]
    },
    {
      id: 'atualizacoes',
      title: '14. Atualizações da Política',
      content: [
        'Esta Política de Privacidade poderá ser atualizada a qualquer tempo.',
        'Alterações relevantes serão comunicadas aos usuários por meio da plataforma.',
        'O uso contínuo dos serviços após a atualização implica concordância com os novos termos.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-600">
            Última atualização: 15 de janeiro de 2026
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          {sections.map(section => (
            <div key={section.id} className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content.map((text, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Privacy
