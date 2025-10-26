
    
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {LayoutDashboard, Beef, DollarSign, MapPin, Scale, Calendar, Calculator, Bell, Heart, ChevronLeft, ChevronRight} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Animais', href: '/animals', icon: Beef },
    { name: 'Financeiro', href: '/financial', icon: DollarSign },
    { name: 'Pesagem', href: '/weighing' , icon: Scale},
    { name: 'Pastagens', href: '/pastures', icon: MapPin },
    { name: 'Planejamento', href: '/planning', icon: Calendar },
    { name: 'Notificações', href: '/notifications', icon: Bell },
    { name: 'Estimativa', href: '/estimativa', icon: Calculator},
    { name: 'Saúde da Empresa', href: '/company-health', icon: Heart }
  ]

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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]
        ${isOpen ? 'w-64' : 'lg:w-16'}
      `}>
        {/* Toggle Button */}
        <div className="hidden lg:flex justify-end p-2 border-b">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-green-100 text-green-700 border-r-2 border-[#00875e]'
                      : 'text-gray-600 hover:text-[#00875e] hover:bg-green-50'
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
          </div>
        </nav>

        {/* Footer da Sidebar */}
        {isOpen && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="text-xs text-gray-500 text-center">
              Rebanho Digital
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar

    