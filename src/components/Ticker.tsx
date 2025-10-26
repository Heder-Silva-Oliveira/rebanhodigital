// components/ContinuousTicker.tsx
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, Users, Beef } from 'lucide-react';

interface TickerItem {
  id: number;
  text: string;
  type: 'price' | 'commodity' | 'stats' | 'news' | 'offer';
}

export const ContinuousTicker: React.FC = () => {
  const tickerItems: TickerItem[] = [
    { id: 1, text: "🐄 20 novilhas 12@ - R$ 280,00/@ - MT", type: "offer" },
    { id: 2, text: "🐂 15 bois 18@ - R$ 295,00/@ - MS", type: "offer" },
    { id: 3, text: "🐄 30 vacas prenhes - R$ 3.200,00/cab - GO", type: "offer" },
    { id: 4, text: "🐃 50 bezerros 6@ - R$ 1.850,00/cab - PR", type: "offer" },
    { id: 5, text: "🐄 25 novilhas 14@ - R$ 275,00/@ - SP", type: "offer" },
    { id: 6, text: "🎯 BeefPrice: R$ 315,80/@ - Alta 2,3%", type: "price" },
    { id: 7, text: "📈 Milho: R$ 67,45/sc - Queda 1,2%", type: "commodity" },
    { id: 8, text: "💰 Arroba boi gordo: R$ 298,75", type: "price" },
    { id: 9, text: "⚡ 5.247 fazendas na plataforma", type: "stats" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const calculateWidth = () => {
      if (containerRef.current) {
        // Calcula a largura de UMA cópia dos itens
        const firstCopy = containerRef.current.querySelector('.ticker-copy:first-child') as HTMLDivElement;
        if (firstCopy) {
          setContentWidth(firstCopy.scrollWidth);
        }
      }
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'price': return <DollarSign className="w-3 h-3 mr-2 text-green-400 flex-shrink-0" />;
      case 'commodity': return <Activity className="w-3 h-3 mr-2 text-yellow-400 flex-shrink-0" />;
      case 'stats': return <Users className="w-3 h-3 mr-2 text-blue-400 flex-shrink-0" />;
      case 'offer': return <Beef className="w-3 h-3 mr-2 text-red-400 flex-shrink-0" />;
      default: return <TrendingUp className="w-3 h-3 mr-2 text-purple-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden border-b border-gray-700">
      <div className="flex items-center">
        <div className="bg-green-600 px-4 py-1 z-10 flex items-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 mr-2" />
          <span className="font-semibold text-sm whitespace-nowrap">MERCADO AGRO</span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <motion.div
            ref={containerRef}
            className="flex whitespace-nowrap"
            animate={{
              x: contentWidth ? [0, -contentWidth] : [0, -1800] // Da direita (0) para esquerda (-width)
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear"
              }
            }}
          >
            {/* Primeira cópia */}
            <div className="ticker-copy flex">
              {tickerItems.map((item) => (
                <div key={`first-${item.id}`} className="inline-flex items-center mx-6 text-sm whitespace-nowrap">
                  {getIcon(item.type)}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            
            {/* Segunda cópia (idêntica) */}
            <div className="ticker-copy flex">
              {tickerItems.map((item) => (
                <div key={`second-${item.id}`} className="inline-flex items-center mx-6 text-sm whitespace-nowrap">
                  {getIcon(item.type)}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};