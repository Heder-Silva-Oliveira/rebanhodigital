
import React, { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import {Heart, Syringe, Stethoscope, Calendar, Plus, Edit, Trash2, Search, Filter} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface HealthRecord {
  id: string
  recordId: string
  animalId: string
  type: string
  procedure: string
  description: string
  date: string
  veterinarian: string
  medication: string
  dosage: string
  cost: number
  nextDueDate: string
  status: string
  results: string
  sideEffects: string
  attachments: string[]
}

const HealthRecords: React.FC = () => {
  const { data: records, loading, createRecord, updateRecord, deleteRecord } = useCRUD<HealthRecord>({
    entityName: 'health_records',
    sortBy: { date: -1 }
  })

  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAnimal, setFilterAnimal] = useState('')

  const types = ['vacinacao', 'tratamento', 'exame', 'cirurgia', 'medicacao', 'outros']
  const statuses = ['agendado', 'realizado', 'cancelado', 'adiado']

  // Filtrar registros
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || record.type === filterType
    const matchesStatus = !filterStatus || record.status === filterStatus
    const matchesAnimal = !filterAnimal || record.animalId === filterAnimal
    return matchesSearch && matchesType && matchesStatus && matchesAnimal
  })

  // Estatísticas
  const totalRecords = records.length
  const vaccinationRecords = records.filter(r => r.type === 'vacinacao').length
  const treatmentRecords = records.filter(r => r.type === 'tratamento').length
  const upcomingProcedures = records.filter(r => {
    return r.nextDueDate && new Date(r.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }).length

  // Obter lista única de animais
  const uniqueAnimals = [...new Set(records.map(r => r.animalId))].sort()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
  const recordData = {
    recordId: formData.get('recordId') as string,
    animalId: formData.get('animalId') as string,
    type: formData.get('type') as string,
    procedure: formData.get('procedure') as string,
    description: formData.get('description') as string,
      
    // CORREÇÃO: Formatar datas
    date: new Date(formData.get('date') as string).toISOString(), 
      nextDueDate: formData.get('nextDueDate') 
          ? new Date(formData.get('nextDueDate') as string).toISOString() 
          : '',
      
    veterinarian: formData.get('veterinarian') as string,
    medication: formData.get('medication') as string,
    dosage: formData.get('dosage') as string,
    cost: Number(formData.get('cost')),
    status: formData.get('status') as string,
    results: formData.get('results') as string,
    sideEffects: formData.get('sideEffects') as string,
    attachments: [], // Assumindo que o campo de upload será tratado separadamente
      
      // REMOVER CAMPOS GERENCIADOS PELO useCRUD/json-server:
      // creator: 'admin',
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString()
  } as Omit<HealthRecord, 'id'>; // Omitimos 'id' porque ele é gerado ou já existe no editingRecord

  try {
   if (editingRecord) {
    // CORREÇÃO ID AQUI:
    await updateRecord(editingRecord.id, recordData)
    toast.success('Registro de saúde atualizado com sucesso!')
   } else {
    await createRecord(recordData)
    toast.success('Registro de saúde criado com sucesso!')
   }
      setShowForm(false)
      setEditingRecord(null)
    } catch (error) {
      toast.error('Erro ao salvar registro de saúde')
    }
  }

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDelete = async (id: string, procedure: string) => {
    if (confirm(`Tem certeza que deseja excluir o registro "${procedure}"?`)) {
      try {
        await deleteRecord(id)
        toast.success('Registro de saúde excluído com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir registro')
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacinacao': return <Syringe className="text-blue-600" size={20} />
      case 'tratamento': return <Heart className="text-red-600" size={20} />
      case 'exame': return <Stethoscope className="text-green-600" size={20} />
      case 'cirurgia': return <Heart className="text-purple-600" size={20} />
      case 'medicacao': return <Syringe className="text-orange-600" size={20} />
      default: return <Heart className="text-gray-600" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800'
      case 'realizado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      case 'adiado': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = (nextDueDate: string) => {
    if (!nextDueDate) return false
    const dueDate = new Date(nextDueDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return dueDate >= today && dueDate <= thirtyDaysFromNow
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
                <Heart className="mr-3 text-green-600" size={36} />
                Registros de Saúde Animal
              </h1>
              <p className="text-gray-600 mt-2">Acompanhe o histórico médico completo do rebanho</p>
            </div>
            <button
              onClick={() => { setEditingRecord(null); setShowForm(true) }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Novo Registro
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Heart className="text-blue-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Total de Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Syringe className="text-green-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Vacinações</p>
                  <p className="text-2xl font-bold text-green-600">{vaccinationRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Stethoscope className="text-purple-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Tratamentos</p>
                  <p className="text-2xl font-bold text-purple-600">{treatmentRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Calendar className="text-orange-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Próximos 30 dias</p>
                  <p className="text-2xl font-bold text-orange-600">{upcomingProcedures}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por animal, procedimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterAnimal}
                onChange={(e) => setFilterAnimal(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os Animais</option>
                {uniqueAnimals.map(animalId => (
                  <option key={animalId} value={animalId}>{animalId}</option>
                ))}
              </select>
              
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterAnimal('')
                  setFilterType('')
                  setFilterStatus('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Filter size={20} className="mr-2" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(record.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{record.procedure}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      {isUpcoming(record.nextDueDate) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          Próximo Vencimento
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{record.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Animal:</span> {record.animalId}
                      </div>
                      <div>
                        <span className="font-medium">Veterinário:</span> {record.veterinarian}
                      </div>
                      <div>
                        <span className="font-medium">Data:</span> {new Date(record.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Custo:</span> R$ {record.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    {record.medication && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Medicamento:</span> {record.medication}
                        {record.dosage && <span className="ml-2">- Dosagem: {record.dosage}</span>}
                      </div>
                    )}
                    
                    {record.results && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Resultados:</span> {record.results}
                      </div>
                    )}
                    
                    {record.nextDueDate && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Próxima aplicação:</span> {new Date(record.nextDueDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id, record.procedure)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingRecord ? 'Editar Registro de Saúde' : 'Novo Registro de Saúde'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="recordId"
                      placeholder="ID do Registro"
                      defaultValue={editingRecord?.recordId || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="animalId"
                      placeholder="ID do Animal"
                      defaultValue={editingRecord?.animalId || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="type"
                      defaultValue={editingRecord?.type || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecionar Tipo</option>
                      {types.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="procedure"
                      placeholder="Nome do Procedimento"
                      defaultValue={editingRecord?.procedure || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <textarea
                    name="description"
                    placeholder="Descrição detalhada"
                    defaultValue={editingRecord?.description || ''}
                    rows={3}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="date"
                      type="datetime-local"
                      placeholder="Data do Procedimento"
                      defaultValue={editingRecord?.date ? editingRecord.date.slice(0, 16) : ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="veterinarian"
                      placeholder="Veterinário Responsável"
                      defaultValue={editingRecord?.veterinarian || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="medication"
                      placeholder="Medicamento Utilizado"
                      defaultValue={editingRecord?.medication || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="dosage"
                      placeholder="Dosagem"
                      defaultValue={editingRecord?.dosage || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="cost"
                      type="number"
                      step="0.01"
                      placeholder="Custo do Procedimento"
                      defaultValue={editingRecord?.cost || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="nextDueDate"
                      type="date"
                      placeholder="Próxima Data"
                      defaultValue={editingRecord?.nextDueDate ? editingRecord.nextDueDate.split('T')[0] : ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    name="status"
                    defaultValue={editingRecord?.status || 'realizado'}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <textarea
                    name="results"
                    placeholder="Resultados do procedimento"
                    defaultValue={editingRecord?.results || ''}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  <textarea
                    name="sideEffects"
                    placeholder="Efeitos colaterais observados"
                    defaultValue={editingRecord?.sideEffects || ''}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      {editingRecord ? 'Atualizar Registro' : 'Criar Registro'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingRecord(null) }}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HealthRecords
