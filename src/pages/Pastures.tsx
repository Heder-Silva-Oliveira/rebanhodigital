
import React, { useState, useMemo } from 'react'
import {Plus, MapPin, Users, Calendar, AlertTriangle, CheckCircle} from 'lucide-react'
import { useCRUD } from '../hooks/useCRUD'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pasture {
  id: string
  pastureId: string
  name: string
  area: number
  capacity: number
  currentAnimals: number
  status: string
  grassType?: string
  lastRotation?: string
  nextRotation?: string
  soilQuality?: string
  waterSource?: boolean
  fencing?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const Pastures: React.FC = () => {
  const { data: pastures, loading, createRecord, updateRecord, deleteRecord } = useCRUD<Pasture>({
    entityName: 'pastures'
  })

  const [showForm, setShowForm] = useState(false)
  const [editingPasture, setEditingPasture] = useState<Pasture | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  const [formData, setFormData] = useState({
    pastureId: '',
    name: '',
    area: 0,
    capacity: 0,
    currentAnimals: 0,
    status: 'disponivel',
    grassType: '',
    lastRotation: '',
    nextRotation: '',
    soilQuality: 'boa',
    waterSource: true,
    fencing: 'boa',
    notes: ''
  })

  // Filtros
  const filteredPastures = useMemo(() => {
    return pastures.filter(pasture => {
      const matchesStatus = !filterStatus || pasture.status === filterStatus
      return matchesStatus
    })
  }, [pastures, filterStatus])

  // Estatísticas
  const stats = useMemo(() => {
    const totalPastures = pastures.length
    const totalArea = pastures.reduce((sum, p) => sum + p.area, 0)
    const totalCapacity = pastures.reduce((sum, p) => sum + p.capacity, 0)
    const totalAnimals = pastures.reduce((sum, p) => sum + (p.currentAnimals || 0), 0)
    const availablePastures = pastures.filter(p => p.status === 'disponivel').length
    const occupiedPastures = pastures.filter(p => p.status === 'ocupado').length
    const restingPastures = pastures.filter(p => p.status === 'descanso').length
    const maintenancePastures = pastures.filter(p => p.status === 'manutencao').length

    return {
      totalPastures,
      totalArea,
      totalCapacity,
      totalAnimals,
      availablePastures,
      occupiedPastures,
      restingPastures,
      maintenancePastures,
      utilizationRate: totalCapacity > 0 ? (totalAnimals / totalCapacity) * 100 : 0
    }
  }, [pastures])

  // Alertas de rotação
  const rotationAlerts = useMemo(() => {
    const today = new Date()
    const alerts = []

    pastures.forEach(pasture => {
      if (pasture.nextRotation) {
        const nextRotationDate = new Date(pasture.nextRotation)
        const daysUntilRotation = Math.ceil((nextRotationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilRotation <= 7 && daysUntilRotation >= 0) {
          alerts.push({
            pasture: pasture.name,
            days: daysUntilRotation,
            type: daysUntilRotation <= 3 ? 'urgent' : 'warning'
          })
        }
      }
    })

    return alerts
  }, [pastures])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const pastureData = {
        ...formData,
        pastureId: formData.pastureId || `P${Date.now().toString().slice(-6)}`,
        area: Number(formData.area),
        capacity: Number(formData.capacity),
        currentAnimals: Number(formData.currentAnimals),
        lastRotation: formData.lastRotation ? new Date(formData.lastRotation).toISOString() : '',
        nextRotation: formData.nextRotation ? new Date(formData.nextRotation).toISOString() : ''
      }
      
      if (editingPasture) {
        await updateRecord(editingPasture.id, pastureData)
      } else {
        await createRecord(pastureData)
      }
      
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar pasto:', error)
    }
  }

  const handleEdit = (pasture: Pasture) => {
    setEditingPasture(pasture)
    setFormData({
      pastureId: pasture.pastureId,
      name: pasture.name,
      area: pasture.area,
      capacity: pasture.capacity,
      currentAnimals: pasture.currentAnimals || 0,
      status: pasture.status,
      grassType: pasture.grassType || '',
      lastRotation: pasture.lastRotation?.split('T')[0] || '',
      nextRotation: pasture.nextRotation?.split('T')[0] || '',
      soilQuality: pasture.soilQuality || 'boa',
      waterSource: pasture.waterSource ?? true,
      fencing: pasture.fencing || 'boa',
      notes: pasture.notes || ''
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPasture(null)
    setFormData({
      pastureId: '',
      name: '',
      area: 0,
      capacity: 0,
      currentAnimals: 0,
      status: 'disponivel',
      grassType: '',
      lastRotation: '',
      nextRotation: '',
      soilQuality: 'boa',
      waterSource: true,
      fencing: 'boa',
      notes: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ocupado: 'bg-red-100 text-red-800',
      descanso: 'bg-yellow-100 text-yellow-800',
      manutencao: 'bg-orange-100 text-orange-800',
      disponivel: 'bg-green-100 text-green-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getQualityColor = (quality?: string) => {
    const colors = {
      excelente: 'bg-green-100 text-green-800',
      boa: 'bg-blue-100 text-blue-800',
      regular: 'bg-yellow-100 text-yellow-800',
      ruim: 'bg-red-100 text-red-800'
    }
    return colors[quality as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
      <div className="max-w-screen-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Pastagens</h1>
            <p className="text-gray-600">Controle de rotação e qualidade dos pastos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Novo Pasto</span>
          </button>
        </div>

        {/* Alertas de Rotação */}
        {rotationAlerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center mb-2">
              <AlertTriangle className="text-yellow-600 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-yellow-800">Alertas de Rotação</h3>
            </div>
            <div className="space-y-2">
              {rotationAlerts.map((alert, index) => (
                <div key={index} className={`text-sm ${alert.type === 'urgent' ? 'text-red-700' : 'text-yellow-700'}`}>
                  <strong>{alert.pasture}</strong> - Rotação em {alert.days} dia{alert.days !== 1 ? 's' : ''}
                  {alert.type === 'urgent' && <span className="ml-2 font-bold">URGENTE</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total de Pastos</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPastures}</p>
              </div>
              <MapPin className="text-green-600" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Área Total</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalArea} ha</p>
              </div>
              <MapPin className="text-blue-600" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Capacidade Total</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalCapacity}</p>
              </div>
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Taxa de Utilização</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.utilizationRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{stats.availablePastures}</p>
            <p className="text-sm text-gray-600">Disponíveis</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold text-red-600">{stats.occupiedPastures}</p>
            <p className="text-sm text-gray-600">Ocupados</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.restingPastures}</p>
            <p className="text-sm text-gray-600">Em Descanso</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.maintenancePastures}</p>
            <p className="text-sm text-gray-600">Manutenção</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos os Status</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="descanso">Em Descanso</option>
              <option value="manutencao">Manutenção</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              {filteredPastures.length} de {pastures.length} pastos
            </div>
          </div>
        </div>

        {/* Lista de Pastagens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPastures.map((pasture) => (
            <div key={pasture.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{pasture.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(pasture.status)}`}>
                    {pasture.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID:</span>
                    <span className="font-medium">{pasture.pastureId}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Área:</span>
                    <span className="font-medium">{pasture.area} hectares</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacidade:</span>
                    <span className="font-medium">{pasture.capacity} animais</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Animais Atuais:</span>
                    <span className="font-medium">{pasture.currentAnimals || 0} animais</span>
                  </div>
                  
                  {pasture.grassType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tipo de Gramínea:</span>
                      <span className="font-medium">{pasture.grassType}</span>
                    </div>
                  )}
                  
                  {pasture.soilQuality && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Qualidade do Solo:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getQualityColor(pasture.soilQuality)}`}>
                        {pasture.soilQuality}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fonte de Água:</span>
                    <span className="font-medium">{pasture.waterSource ? 'Sim' : 'Não'}</span>
                  </div>
                  
                  {pasture.fencing && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estado da Cerca:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getQualityColor(pasture.fencing)}`}>
                        {pasture.fencing}
                      </span>
                    </div>
                  )}
                  
                  {pasture.lastRotation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Última Rotação:</span>
                      <span className="font-medium">
                        {format(new Date(pasture.lastRotation), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {pasture.nextRotation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Próxima Rotação:</span>
                      <span className="font-medium">
                        {format(new Date(pasture.nextRotation), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {pasture.notes && (
                    <div className="text-sm">
                      <span className="text-gray-500">Observações:</span>
                      <p className="text-gray-700 mt-1">{pasture.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ocupação</span>
                    <span>{((pasture.currentAnimals || 0) / pasture.capacity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((pasture.currentAnimals || 0) / pasture.capacity * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(pasture)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja remover este pasto?')) {
                        deleteRecord(pasture.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPastures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum pasto encontrado</p>
            <p className="text-gray-400 mt-2">Comece adicionando seus primeiros pastos</p>
          </div>
        )}

        {/* Formulário de Pasto */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPasture ? 'Editar Pasto' : 'Novo Pasto'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Pasto *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID do Pasto
                    </label>
                    <input
                      type="text"
                      name="pastureId"
                      value={formData.pastureId}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área (hectares) *
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidade (animais) *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animais Atuais
                    </label>
                    <input
                      type="number"
                      name="currentAnimals"
                      value={formData.currentAnimals}
                      onChange={handleChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="descanso">Em Descanso</option>
                      <option value="manutencao">Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Gramínea
                    </label>
                    <input
                      type="text"
                      name="grassType"
                      value={formData.grassType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualidade do Solo
                    </label>
                    <select
                      name="soilQuality"
                      value={formData.soilQuality}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="excelente">Excelente</option>
                      <option value="boa">Boa</option>
                      <option value="regular">Regular</option>
                      <option value="ruim">Ruim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado da Cerca
                    </label>
                    <select
                      name="fencing"
                      value={formData.fencing}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="excelente">Excelente</option>
                      <option value="boa">Boa</option>
                      <option value="precisa_reparo">Precisa Reparo</option>
                      <option value="ruim">Ruim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Última Rotação
                    </label>
                    <input
                      type="date"
                      name="lastRotation"
                      value={formData.lastRotation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Próxima Rotação
                    </label>
                    <input
                      type="date"
                      name="nextRotation"
                      value={formData.nextRotation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="waterSource"
                      checked={formData.waterSource}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Possui fonte de água
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Observações sobre o pasto..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingPasture ? 'Atualizar' : 'Criar'} Pasto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pastures
