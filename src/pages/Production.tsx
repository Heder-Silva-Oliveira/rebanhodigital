
import React, { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import {Milk, Beef, Baby, TrendingUp, Plus, Edit, Trash2, Filter} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface ProductionRecord {
  _id: string
  recordId: string
  type: string
  animalId: string
  animalGroup: string
  date: string
  quantity: number
  unit: string
  quality: string
  milkFat: number
  milkProtein: number
  somatic_cells: number
  weight: number
  carcassYield: number
  pregnancyStatus: string
  calvingDate: string
  notes: string
}

const Production: React.FC = () => {
  const { data: records, loading, createRecord, updateRecord, deleteRecord } = useCRUD<ProductionRecord>({
    entityName: 'production_records',
    sortBy: { date: -1 }
  })

  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null)
  const [filterType, setFilterType] = useState('')
  const [filterAnimal, setFilterAnimal] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('30') // dias

  const types = ['leite', 'carne', 'reproducao', 'ovos', 'la', 'outros']
  const units = ['litros', 'kg', 'unidades', 'cabecas']
  const qualities = ['excelente', 'boa', 'regular', 'ruim']
  const pregnancyStatuses = ['prenha', 'vazia', 'indefinido']

  // Filtrar registros por período
  const periodDate = new Date()
  periodDate.setDate(periodDate.getDate() - parseInt(filterPeriod))

  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.date)
    const matchesPeriod = recordDate >= periodDate
    const matchesType = !filterType || record.type === filterType
    const matchesAnimal = !filterAnimal || record.animalId === filterAnimal
    return matchesPeriod && matchesType && matchesAnimal
  })

  // Obter lista única de animais
  const uniqueAnimals = [...new Set(records.map(r => r.animalId))].sort()

  // Estatísticas gerais
  const milkRecords = filteredRecords.filter(r => r.type === 'leite')
  const totalMilkProduction = milkRecords.reduce((sum, r) => sum + r.quantity, 0)
  const avgMilkPerDay = milkRecords.length > 0 ? totalMilkProduction / milkRecords.length : 0

  const meatRecords = filteredRecords.filter(r => r.type === 'carne')
  const totalMeatProduction = meatRecords.reduce((sum, r) => sum + r.weight, 0)

  const reproductionRecords = filteredRecords.filter(r => r.type === 'reproducao')

  // Dados para gráficos
  const dailyMilkData = milkRecords.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString('pt-BR')
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.quantity += record.quantity
    } else {
      acc.push({ date, quantity: record.quantity })
    }
    return acc
  }, [] as any[]).slice(-7) // últimos 7 dias

  const productionByType = types.map(type => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: filteredRecords.filter(r => r.type === type).length
  })).filter(item => item.count > 0)

  const qualityDistribution = qualities.map(quality => ({
    quality: quality.charAt(0).toUpperCase() + quality.slice(1),
    count: filteredRecords.filter(r => r.quality === quality).length
  })).filter(item => item.count > 0)

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const recordData = {
      recordId: formData.get('recordId') as string,
      type: formData.get('type') as string,
      animalId: formData.get('animalId') as string,
      animalGroup: formData.get('animalGroup') as string,
      date: new Date(formData.get('date') as string).toISOString(),
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      quality: formData.get('quality') as string,
      milkFat: Number(formData.get('milkFat')) || 0,
      milkProtein: Number(formData.get('milkProtein')) || 0,
      somatic_cells: Number(formData.get('somatic_cells')) || 0,
      weight: Number(formData.get('weight')) || 0,
      carcassYield: Number(formData.get('carcassYield')) || 0,
      pregnancyStatus: formData.get('pregnancyStatus') as string,
      calvingDate: formData.get('calvingDate') ? new Date(formData.get('calvingDate') as string).toISOString() : '',
      notes: formData.get('notes') as string,
      creator: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      if (editingRecord) {
        await updateRecord(editingRecord._id, recordData)
        toast.success('Registro de produção atualizado!')
      } else {
        await createRecord(recordData)
        toast.success('Registro de produção criado!')
      }
      setShowForm(false)
      setEditingRecord(null)
    } catch (error) {
      toast.error('Erro ao salvar registro')
    }
  }

  const handleEdit = (record: ProductionRecord) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDelete = async (id: string, recordId: string) => {
    if (confirm(`Tem certeza que deseja excluir o registro "${recordId}"?`)) {
      try {
        await deleteRecord(id)
        toast.success('Registro excluído com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir registro')
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'leite': return <Milk className="text-blue-600" size={20} />
      case 'carne': return <Beef className="text-red-600" size={20} />
      case 'reproducao': return <Baby className="text-pink-600" size={20} />
      default: return <TrendingUp className="text-gray-600" size={20} />
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excelente': return 'bg-green-100 text-green-800'
      case 'boa': return 'bg-blue-100 text-blue-800'
      case 'regular': return 'bg-yellow-100 text-yellow-800'
      case 'ruim': return 'bg-red-100 text-red-800'
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
                <TrendingUp className="mr-3 text-green-600" size={36} />
                Controle de Produção
              </h1>
              <p className="text-gray-600 mt-2">Monitore e analise a produtividade do rebanho</p>
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
                <Milk className="text-blue-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Produção de Leite</p>
                  <p className="text-2xl font-bold text-blue-600">{totalMilkProduction.toFixed(1)}L</p>
                  <p className="text-sm text-gray-500">Últimos {filterPeriod} dias</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="text-green-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Média Diária</p>
                  <p className="text-2xl font-bold text-green-600">{avgMilkPerDay.toFixed(1)}L</p>
                  <p className="text-sm text-gray-500">Por animal</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Beef className="text-red-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Produção de Carne</p>
                  <p className="text-2xl font-bold text-red-600">{totalMeatProduction}kg</p>
                  <p className="text-sm text-gray-500">Peso total</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Baby className="text-pink-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Reprodução</p>
                  <p className="text-2xl font-bold text-pink-600">{reproductionRecords.length}</p>
                  <p className="text-sm text-gray-500">Eventos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
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
                value={filterAnimal}
                onChange={(e) => setFilterAnimal(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os Animais</option>
                {uniqueAnimals.map(animalId => (
                  <option key={animalId} value={animalId}>{animalId}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setFilterType('')
                  setFilterAnimal('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Filter size={20} className="mr-2" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Produção Diária de Leite */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Produção Diária de Leite (Últimos 7 dias)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyMilkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quantity" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Tipo */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Registros por Tipo de Produção</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productionByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {productionByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição de Qualidade */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Qualidade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quality" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Produção por Animal */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top 5 Produtores de Leite</h3>
            <div className="space-y-3">
              {uniqueAnimals.slice(0, 5).map(animalId => {
                const animalRecords = milkRecords.filter(r => r.animalId === animalId)
                const totalProduction = animalRecords.reduce((sum, r) => sum + r.quantity, 0)
                const avgProduction = animalRecords.length > 0 ? totalProduction / animalRecords.length : 0
                
                return (
                  <div key={animalId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{animalId}</p>
                      <p className="text-sm text-gray-500">{animalRecords.length} registros</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{totalProduction.toFixed(1)}L</p>
                      <p className="text-sm text-gray-500">Média: {avgProduction.toFixed(1)}L</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Registros de Produção</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.slice(0, 10).map((record) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(record.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.animalId}</div>
                      <div className="text-sm text-gray-500">{record.animalGroup}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.quantity} {record.unit}</div>
                      {record.type === 'leite' && record.milkFat > 0 && (
                        <div className="text-xs text-gray-500">
                          Gordura: {record.milkFat}% | Proteína: {record.milkProtein}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(record.quality)}`}>
                        {record.quality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(record._id, record.recordId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingRecord ? 'Editar Registro de Produção' : 'Novo Registro de Produção'}
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="animalId"
                      placeholder="ID do Animal"
                      defaultValue={editingRecord?.animalId || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="animalGroup"
                      placeholder="Grupo de Animais"
                      defaultValue={editingRecord?.animalGroup || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      name="date"
                      type="datetime-local"
                      defaultValue={editingRecord?.date ? editingRecord.date.slice(0, 16) : ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="quantity"
                      type="number"
                      step="0.01"
                      placeholder="Quantidade"
                      defaultValue={editingRecord?.quantity || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <select
                      name="unit"
                      defaultValue={editingRecord?.unit || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Unidade</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  
                  <select
                    name="quality"
                    defaultValue={editingRecord?.quality || ''}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecionar Qualidade</option>
                    {qualities.map(quality => (
                      <option key={quality} value={quality}>
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  {/* Campos específicos para leite */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      name="milkFat"
                      type="number"
                      step="0.1"
                      placeholder="% Gordura (leite)"
                      defaultValue={editingRecord?.milkFat || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="milkProtein"
                      type="number"
                      step="0.1"
                      placeholder="% Proteína (leite)"
                      defaultValue={editingRecord?.milkProtein || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="somatic_cells"
                      type="number"
                      placeholder="Células Somáticas"
                      defaultValue={editingRecord?.somatic_cells || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Campos específicos para carne */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="weight"
                      type="number"
                      step="0.1"
                      placeholder="Peso (kg)"
                      defaultValue={editingRecord?.weight || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="carcassYield"
                      type="number"
                      step="0.1"
                      placeholder="Rendimento de Carcaça (%)"
                      defaultValue={editingRecord?.carcassYield || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Campos específicos para reprodução */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="pregnancyStatus"
                      defaultValue={editingRecord?.pregnancyStatus || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Status Reprodutivo</option>
                      {pregnancyStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="calvingDate"
                      type="date"
                      placeholder="Data do Parto"
                      defaultValue={editingRecord?.calvingDate ? editingRecord.calvingDate.split('T')[0] : ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <textarea
                    name="notes"
                    placeholder="Observações"
                    defaultValue={editingRecord?.notes || ''}
                    rows={3}
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

export default Production
