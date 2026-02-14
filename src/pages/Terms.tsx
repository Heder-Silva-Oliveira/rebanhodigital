import React from 'react'
import { motion } from 'framer-motion'
import { Shield, FileText, Scale, AlertTriangle } from 'lucide-react'

export const Terms: React.FC = () => {
  const sections = [
    {
      id: 'aceite',
      title: '1. Aceite dos Termos',
      content: [
        'Ao acessar ou utilizar a plataforma Rebanho Digital, o usuário declara ter lido, compreendido e aceitado integralmente estes Termos de Uso.',
        'Caso o usuário não concorde com qualquer disposição destes termos, não deverá utilizar a plataforma.',
        'A Rebanho Digital poderá atualizar estes termos a qualquer momento, sendo responsabilidade do usuário verificá-los periodicamente.'
      ]
    },
    {
      id: 'servicos',
      title: '2. Descrição dos Serviços',
      content: [
        'A Rebanho Digital disponibiliza uma plataforma digital destinada à gestão de propriedades pecuárias, incluindo controle de rebanho, registros operacionais, gestão financeira básica e geração de relatórios.',
        'A plataforma atua como ferramenta de apoio à organização e visualização de informações inseridas pelo próprio usuário.',
        'Os serviços poderão ser alterados, suspensos ou descontinuados a qualquer momento, sem garantia de disponibilidade contínua.'
      ]
    },
    {
      id: 'disclaimer',
      title: '3. Disclaimer Técnico',
      content: [
        'A Rebanho Digital não presta serviços de consultoria técnica, veterinária, zootécnica, agronômica, contábil, financeira ou jurídica.',
        'As informações, relatórios e análises gerados pela plataforma possuem caráter meramente informativo e auxiliar.',
        'Toda e qualquer decisão tomada com base nos dados da plataforma é de responsabilidade exclusiva do usuário.'
      ]
    },
    {
      id: 'conta',
      title: '4. Conta de Usuário',
      content: [
        'Para utilizar os serviços, o usuário deverá criar uma conta fornecendo informações verdadeiras, completas e atualizadas.',
        'O usuário é o único responsável pela guarda e confidencialidade de suas credenciais de acesso.',
        'Qualquer atividade realizada na conta será considerada de responsabilidade do titular.',
        'A Rebanho Digital poderá suspender ou encerrar contas que violem estes termos ou a legislação vigente.'
      ]
    },
    {
      id: 'uso',
      title: '5. Uso Aceitável da Plataforma',
      content: [
        'O usuário compromete-se a utilizar a plataforma exclusivamente para fins lícitos.',
        'É vedada a utilização da plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros.',
        'É proibido tentar acessar áreas restritas, sistemas ou dados sem autorização.',
        'O compartilhamento de contas ou credenciais de acesso é expressamente proibido.'
      ]
    },
    {
      id: 'dados',
      title: '6. Dados e Privacidade',
      content: [
        'O tratamento de dados pessoais é realizado conforme descrito na Política de Privacidade da Rebanho Digital.',
        'O usuário permanece como titular e proprietário dos dados inseridos na plataforma.',
        'A Rebanho Digital adota medidas técnicas e organizacionais para proteção dos dados.',
        'O usuário poderá solicitar acesso, exportação ou exclusão de seus dados, observadas as obrigações legais.'
      ]
    },
    {
      id: 'pagamento',
      title: '7. Planos, Pagamento e Assinatura',
      content: [
        'O acesso a determinadas funcionalidades poderá estar condicionado à contratação de planos pagos.',
        'Os valores, condições e recursos de cada plano estarão descritos na plataforma.',
        'Os pagamentos são processados por intermediadores terceiros, não sendo armazenados dados bancários pela Rebanho Digital.',
        'Salvo disposição legal em contrário, os valores pagos não são reembolsáveis.',
        'O usuário poderá cancelar sua assinatura a qualquer momento, com efeitos ao final do período contratado.'
      ]
    },
    {
      id: 'propriedade',
      title: '8. Propriedade Intelectual',
      content: [
        'Todos os direitos de propriedade intelectual sobre a plataforma pertencem exclusivamente à Rebanho Digital.',
        'É concedida ao usuário uma licença limitada, não exclusiva e intransferível para uso da plataforma.',
        'É vedada a cópia, modificação, distribuição, engenharia reversa ou criação de obras derivadas.',
        'O uso indevido poderá resultar em responsabilização civil e criminal.'
      ]
    },
    {
      id: 'responsabilidade',
      title: '9. Limitação de Responsabilidade',
      content: [
        'A plataforma é fornecida no estado em que se encontra, sem garantias de resultado econômico, produtivo ou financeiro.',
        'A Rebanho Digital não se responsabiliza por perdas, danos indiretos, lucros cessantes ou prejuízos decorrentes do uso da plataforma.',
        'A responsabilidade total da Rebanho Digital, quando aplicável, limita-se ao valor efetivamente pago pelo usuário nos últimos 12 meses.',
        'Nada nestes termos exclui ou limita responsabilidades nos casos de dolo, fraude ou quando a legislação brasileira assim determinar.'
      ]
    },
    {
      id: 'rescisao',
      title: '10. Rescisão',
      content: [
        'O usuário poderá encerrar sua conta a qualquer momento por meio das configurações da plataforma.',
        'A Rebanho Digital poderá suspender ou encerrar o acesso em caso de violação destes termos.',
        'Após o encerramento, o usuário perderá o acesso à plataforma.',
        'O usuário poderá solicitar a exportação de seus dados pelo prazo legal aplicável, conforme a LGPD.'
      ]
    },
    {
      id: 'foro',
      title: '11. Disposições Gerais e Foro',
      content: [
        'Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.',
        'Quando caracterizada relação de consumo, será competente o foro do domicílio do usuário.',
        'Nos demais casos, fica eleito o foro da comarca de Londrina, Paraná.',
        'A eventual invalidade de alguma cláusula não afetará as demais disposições.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-50 to-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Termos de Uso
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

export default Terms
