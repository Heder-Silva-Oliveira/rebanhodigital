
import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {Play, ArrowRight} from 'lucide-react'

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen ">
      {/* Hero Section - Verde como na imagem */}
      <section className="bg-[#00875e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texto à esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Revolucione a<br />
                Gestão do seu<br />
                Gado
              </h1>
              
              <p className="text-lg lg:text-xl text-green-100 mb-8 leading-relaxed max-w-md">
                Aumente sua rentabilidade em até 30% com 
                controle inteligente de rebanho, análise de custos e 
                estimativas precisas de valor.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-[#00875e] text-gray px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Demonstração Gratuita
                </button>
                
                <Link
                  to="/pricing"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00875e] text-white transition-colors flex items-center justify-center"
                >
                  Ver Planos e Preços
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Imagem à direita */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-[#00995e] rounded-2xl p-6 shadow-2xl">
                <img
                  src="\src\img\vacas_no_pasto.jpg"
                  alt="Gado no pasto"
                  className="w-full h-64 lg:h-80 object-cover rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção de Estatísticas */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-[#00875e] text-[#00875e] mb-2">
                  Zero
                </div>
                <div className="text-gray-[#00875e] font-medium">
                  Complexidade
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-[#00875e] text-[#00875e] mb-2">
                  Máxima
                </div>
                <div className="text-gray-[#00875e] font-medium">
                  Eficiência
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-[#00875e] text-[#00875e] mb-2">
                  Total
                </div>
                <div className="text-gray-[#00875e] font-medium">
                  Controle
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-[#00875e] text-[#00875e] mb-2">
                  Gestão
                </div>
                <div className="text-gray-[#00875e] font-medium">
                  Inteligente
                </div>
              </motion.div>
          </div>
        </div>
      </section>

      {/* Seção "Por que escolher a Rebanho Digital?" */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Por que escolher a Rebanho Digital?
            </h2>
            <p className="text-lg text-gray-[#00875e] leading-relaxed">
              Nossa plataforma oferece as ferramentas mais avançadas para transformar sua 
              pecuária em um negócio altamente rentável e eficiente.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
