
import React, { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import {Bell, AlertTriangle, Info, Clock, CheckCircle, Trash2, Filter, Eye, EyeOff} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  notificationId: string
  title: string
  message: string
  type: string
  category: string
  priority: string
  status: string
  targetUser: string
  relatedEntity: string
  relatedEntityId: string
  actionRequired: boolean
  actionUrl: string
  scheduledFor: string
  readAt: string
  resolvedAt: string
  createdAt: string
}

const Notifications: React.FC = () => {
  const { data: notifications, loading, updateRecord, deleteRecord } = useCRUD<Notification>({
    entityName: 'notifications',
    sortBy: { createdAt: -1 }
  })

  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const types = ['alerta', 'lembrete', 'informacao', 'urgente', 'sistema']
  const categories = ['saude_animal', 'estoque', 'financeiro', 'planejamento', 'sistema', 'outros']
  const statuses = ['nao_lida', 'lida', 'arquivada', 'resolvida']
  const priorities = ['baixa', 'media', 'alta', 'critica']

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = !filterType || notification.type === filterType
    const matchesCategory = !filterCategory || notification.category === filterCategory
    const matchesStatus = !filterStatus || notification.status === filterStatus
    const matchesPriority = !filterPriority || notification.priority === filterPriority
    return matchesType && matchesCategory && matchesStatus && matchesPriority
  })

  // Estatísticas
  const totalNotifications = notifications.length
  const unreadNotifications = notifications.filter(n => n.status === 'nao_lida').length
  const urgentNotifications = notifications.filter(n => n.priority === 'critica' && n.status === 'nao_lida').length
  const actionRequiredNotifications = notifications.filter(n => n.actionRequired && n.status === 'nao_lida').length

  const markAsRead = async (notification: Notification) => {
    if (notification.status === 'nao_lida') {
      try {
        await updateRecord(notification._id, {
          status: 'lida',
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        toast.success('Notificação marcada como lida')
      } catch (error) {
        toast.error('Erro ao marcar como lida')
      }
    }
  }

  const markAsUnread = async (notification: Notification) => {
    if (notification.status === 'lida') {
      try {
        await updateRecord(notification._id, {
          status: 'nao_lida',
          readAt: '',
          updatedAt: new Date().toISOString()
        })
        toast.success('Notificação marcada como não lida')
      } catch (error) {
        toast.error('Erro ao marcar como não lida')
      }
    }
  }

  const resolveNotification = async (notification: Notification) => {
    try {
      await updateRecord(notification._id, {
        status: 'resolvida',
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      toast.success('Notificação marcada como resolvida')
    } catch (error) {
      toast.error('Erro ao resolver notificação')
    }
  }

  const deleteNotification = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir a notificação "${title}"?`)) {
      try {
        await deleteRecord(id)
        toast.success('Notificação excluída com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir notificação')
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alerta': return <AlertTriangle size={20} className="text-yellow-600" />
      case 'urgente': return <AlertTriangle size={20} className="text-red-600" />
      case 'lembrete': return <Clock size={20} className="text-blue-600" />
      case 'informacao': return <Info size={20} className="text-green-600" />
      case 'sistema': return <Bell size={20} className="text-gray-600" />
      default: return <Bell size={20} className="text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'bg-gray-100 text-gray-800'
      case 'media': return 'bg-blue-100 text-blue-800'
      case 'alta': return 'bg-yellow-100 text-yellow-800'
      case 'critica': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nao_lida': return 'bg-blue-100 text-blue-800'
      case 'lida': return 'bg-gray-100 text-gray-800'
      case 'arquivada': return 'bg-purple-100 text-purple-800'
      case 'resolvida': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="mr-3 text-green-600" size={36} />
                Central de Notificações
              </h1>
              <p className="text-gray-600 mt-2">Acompanhe alertas, lembretes e informações importantes</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Bell className="text-blue-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{totalNotifications}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Eye className="text-blue-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Não Lidas</p>
                  <p className="text-2xl font-bold text-blue-600">{unreadNotifications}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="text-red-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{urgentNotifications}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="text-orange-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Requer Ação</p>
                  <p className="text-2xl font-bold text-orange-600">{actionRequiredNotifications}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os Tipos</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todas as Prioridades</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setFilterType('')
                  setFilterCategory('')
                  setFilterStatus('')
                  setFilterPriority('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Filter size={20} className="mr-2" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 ${
                notification.status === 'nao_lida' ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${notification.status === 'nao_lida' ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                        {notification.status.replace('_', ' ')}
                      </span>
                      {notification.actionRequired && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          Ação Requerida
                        </span>
                      )}
                    </div>
                    
                    <p className={`mb-3 ${notification.status === 'nao_lida' ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Categoria:</span> {notification.category.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Criado em:</span> {new Date(notification.createdAt).toLocaleDateString('pt-BR')} às {new Date(notification.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {notification.readAt && (
                        <div>
                          <span className="font-medium">Lido em:</span> {new Date(notification.readAt).toLocaleDateString('pt-BR')} às {new Date(notification.readAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {notification.status === 'nao_lida' ? (
                    <button
                      onClick={() => markAsRead(notification)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Marcar como lida"
                    >
                      <Eye size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsUnread(notification)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Marcar como não lida"
                    >
                      <EyeOff size={16} />
                    </button>
                  )}
                  
                  {notification.actionRequired && notification.status !== 'resolvida' && (
                    <button
                      onClick={() => resolveNotification(notification)}
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marcar como resolvida"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification._id, notification.title)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir notificação"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma notificação encontrada</h3>
            <p className="mt-2 text-gray-500">
              {notifications.length === 0 
                ? 'Você não tem notificações no momento.'
                : 'Tente ajustar os filtros para ver mais notificações.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
