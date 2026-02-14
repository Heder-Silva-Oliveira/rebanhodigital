import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PLAN_LIMITS_FRONTEND } from '../planConfig'; // Importa a configuração de planos
import {
  LayoutDashboard, 
  Beef, 
  DollarSign, 
  MapPin, 
  Scale, 
  Calendar, 
  Calculator, 
  Bell, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Lock, // Ícone para features "Pro"
  Users,
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  feature: string | null;
  adminOnly?: boolean;
}

// 1. Definimos a "lista mestre" de todos os itens possíveis
const ALL_SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, feature: null },
  { name: 'Animais', href: '/animals', icon: Beef, feature: null },
  { name: 'Financeiro', href: '/financial', icon: DollarSign, feature: null },
  { name: 'Pesagem', href: '/weighing' , icon: Scale, feature: null},
  { name: 'Pastagens', href: '/pastures', icon: MapPin, feature: null },
  { name: 'Planejamento', href: '/planning', icon: Calendar, feature: 'planning' },
  { name: 'Notificações', href: '/notifications', icon: Bell, feature: null },
  { name: 'Estimativa', href: '/estimativa', icon: Calculator, feature: null},
  { name: 'Formulação', href: '/formulacao', icon: Scale, feature: null },
  { name: 'Saúde da Empresa', href: '/company-health', icon: Heart, feature: 'companyHealth' },
  { name: 'Usuários', href: '/usuarios', icon: Users, feature: 'multiUser', adminOnly: true },
  { name: 'Planos', href: '/planos', icon: CreditCard, feature: null },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation()
  
  // 3. ✅ CORREÇÃO: Pegamos 'isAuthenticated' E 'user' do hook
  const { isAuthenticated, user } = useAuth()

  // 4. ✅ CORREÇÃO: Determinamos o plano e filtramos os itens
  const userPlan = user?.plan || 'free';
  const planConfig = PLAN_LIMITS_FRONTEND[userPlan] || PLAN_LIMITS_FRONTEND.free;

  // Filtra a lista de itens com base nas features do plano
  const sidebarItems = ALL_SIDEBAR_ITEMS.filter(item => {
    // Se for adminOnly, verifica se o usuário é admin
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    
    // Se não for uma feature especial, mostra (feature: null)
    if (!item.feature) {
      return true;
    }
    // Se for uma feature, checa se o plano do usuário tem acesso
    return planConfig.features[item.feature as keyof typeof planConfig.features] === true;
  });

  const isActive = (path: string) => {
    return location.pathname === path
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out
        dark:bg-gray-800 dark:border-r dark:border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-auto lg:min-h-[calc(100vh-4rem)]
        ${isOpen ? 'w-64' : 'lg:w-16'}
      `}>
        {/* Toggle Button */}
        <div className="hidden lg:flex justify-end p-2 border-b dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {/* 5. ✅ CORREÇÃO: Mapeamos a lista JÁ FILTRADA */}
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-r-2 border-[#00875e] dark:border-green-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#00875e] dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                  title={!isOpen ? item.name : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </Link>
              )
            })}
            
            {/* 6. ✅ NOVO: Banner de Upgrade (exemplo) */}
            {isOpen && userPlan === 'free' && (
              <div className="px-3 py-3 mt-4 text-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Lock size={20} className="mx-auto text-yellow-500 mb-2" />
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-2">Plano Gratuito</p>
                <Link 
                  to="/planos" // Crie esta página
                  className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  Fazer Upgrade
                </Link>
              </div>
            )}
            
          </div>
        </nav>

        {/* Footer da Sidebar */}
        {isOpen && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Rebanho Digital
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
