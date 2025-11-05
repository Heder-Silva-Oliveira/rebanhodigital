import React from 'react'
import { motion } from 'framer-motion'
import { Target, Heart, Shield, Users, Award, TrendingUp } from 'lucide-react'


export const About: React.FC = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: 'Inovação',
      description: 'Transformamos dados em decisões inteligentes para o campo moderno.'
    },
    {
      icon: <Heart className="w-8 h-8 text-green-600" />,
      title: 'Compromisso',
      description: 'Crescemos junto com o produtor, valorizando resultados sustentáveis.'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'Confiabilidade',
      description: 'Segurança, precisão e estabilidade para quem confia no digital.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: 'Parceria',
      description: 'Trabalhamos lado a lado com o produtor para potencializar seu negócio.'
    }
  ]

  const stats = [
    { number: '+Lucro', label: 'Aumento da Rentabilidade' },
    { number: '-Custos', label: 'Redução de Desperdícios' },
    { number: '100%', label: 'Foco no Produtor' },
    { number: '24/7', label: 'Suporte Dedicado' }
  ]

  const team = [
    {
      name: 'Héder Silva',
      role: 'CEO, CTO & Fundador',
      bio: 'Engenheiro de dados especialista em nuvem e automação agropecuária.',
      image: '/src/assets/fakeheder.png'
    },
    {
      name: 'Géder Silva',
      role: 'Head de Produto & Co-Fundador',
      bio: 'Zootecnista e especialista em gestão de propriedades rurais.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-[#00875e] from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-gray-200 mb-6">
              Conectando o campo à tecnologia
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A <strong>Rebanho Digital</strong> é uma plataforma de gestão pecuária que une
              inovação e simplicidade para aumentar a produtividade, reduzir custos
              e transformar a tomada de decisão do produtor rural.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Nossa História
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Fundada em 2025, a <strong>Rebanho Digital</strong> nasceu da união entre a
                  tecnologia e o campo, com o propósito de simplificar e modernizar
                  a gestão pecuária no Brasil.
                </p>
                <p>
                  Observamos que muitos produtores ainda enfrentavam desafios no
                  controle de rebanhos, finanças e indicadores de produtividade.
                  Decidimos, então, criar uma solução que integrasse todos esses
                  pontos em um só sistema.
                </p>
                <p>
                  Hoje, nossa plataforma ajuda fazendas de todos os portes a
                  alcançarem maior eficiência e rentabilidade, com base em dados
                  reais e tecnologia acessível.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="/src/img/rebanho.png"
                alt="Pecuária moderna"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#00875e] text-white p-6 rounded-xl">
                <div className="text-3xl font-bold">1+</div>
                <div className="text-green-100">Ano de Inovação no Campo</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 leading-relaxed">
                Tornar a pecuária mais eficiente e sustentável por meio da tecnologia,
                oferecendo ferramentas simples e inteligentes que empoderam o produtor
                com decisões baseadas em dados.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser referência em gestão digital da pecuária na América Latina,
                reconhecida pela inovação, confiabilidade e contribuição à sustentabilidade
                do agronegócio.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Os princípios que fortalecem nossa conexão entre o digital e o campo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-green-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Resultados que Falam por Si
            </h2>
            <p className="text-xl text-green-100">
              Impactando a produtividade e sustentabilidade da pecuária brasileira
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-green-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossa Equipe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profissionais que unem tecnologia, dados e paixão pelo campo
            </p>
          </motion.div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-items-center max-w-4xl">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg text-center w-full max-w-sm"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Reconhecimento
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Destaque no agronegócio por promover a transformação digital da pecuária,
              com soluções que conectam produtividade, tecnologia e sustentabilidade.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About
