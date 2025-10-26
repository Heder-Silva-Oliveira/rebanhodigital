
import React, { useState, useMemo } from 'react'
import {Heart, Plus, Search, Filter, Edit, Trash2, AlertCircle, Scale, TrendingUp, Calendar, DollarSign, RefreshCw} from 'lucide-react'
import { useCRUD } from '../hooks/useCRUD'
import AnimalForm from '../components/AnimalForm'

interface Animal {
  id: string
  animalId: string
  name: string
  species: string
  breed: string
  birthDate: string
  gender: string
  weight: number
  status: string
  healthStatus: string
  location: string
  motherId?: string
  fatherId?: string
  purchasePrice?: number
  purchaseDate?: string
  notes?: string
  created_at: string
}

const Animals: React.FC = () => {
  const { 
    data: animals, 
    loading, 
    error, 
    createRecord, // <-- Use o nome correto
    updateRecord, // <-- Use o nome correto
    deleteRecord, // <-- Use o nome correto
    reload 
} = useCRUD<Animal>('animals')
  const [showForm, setShowForm] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  console.log('[Animals] Estado atual:', { 
    animalsCount: animals.length, 
    loading, 
    error, 
    showForm, 
    editingAnimal: editingAnimal?.id,
    animals: animals 
  })

  // Debug: Mostrar dados completos
  React.useEffect(() => {
    console.log('[Animals] Dados de animais atualizados:', animals)
    console.log('[Animals] LocalStorage animals_data:', localStorage.getItem('animals_data'))
  }, [animals])

  // Cálculos das métricas
  const metrics = useMemo(() => {
    console.log('[Animals] Calculando métricas para', animals.length, 'animais')
    
    const totalAnimals = animals.length
    
    // Calcular média de arrobas de carcaça
    // Arroba de carcaça = 50% do peso vivo / 15kg (peso de uma arroba)
    const totalArrobasCarcaca = animals.reduce((total, animal) => {
      if (animal.weight && animal.weight > 0) {
        const pesoVivo = animal.weight
        const pesoCarcaca = pesoVivo * 0.5 // 50% do peso vivo
        const arrobasCarcaca = pesoCarcaca / 15 // 15kg por arroba
        return total + arrobasCarcaca
      }
      return total
    }, 0)
    
    const mediaArrobasCarcaca = totalAnimals > 0 ? totalArrobasCarcaca / totalAnimals : 0
    
    // Calcular valor total investido
    const valorTotalInvestido = animals.reduce((total, animal) => {
      return total + (animal.purchasePrice || 0)
    }, 0)
    
    const metricas = {
      totalAnimals,
      mediaArrobasCarcaca: Number(mediaArrobasCarcaca.toFixed(2)),
      valorTotalInvestido
    }
    
    console.log('[Animals] Métricas calculadas:', metricas)
    return metricas
  }, [animals])

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.animalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  console.log('[Animals] Animais filtrados:', filteredAnimals.length, 'de', animals.length)

  const handleSubmit = async (animalData: Omit<Animal, 'id' | 'created_at'>) => {
    console.log('[Animals] Iniciando submissão de animal:', animalData)
    
    try {
      if (editingAnimal) {
        console.log('[Animals] Atualizando animal existente:', editingAnimal.id)
        await updateRecord(editingAnimal.id, animalData)
        console.log('[Animals] Animal atualizado com sucesso')
      } else {
        console.log('[Animals] Criando novo animal')
        const newAnimal = await createRecord(animalData)
        console.log('[Animals] Novo animal criado:', newAnimal)
      }
      
      // Fechar formulário
      setShowForm(false)
      setEditingAnimal(null)
      
      // Recarregar dados para garantir sincronia
      console.log('[Animals] Recarregando dados após submissão')
      await reload()
      
    } catch (error) {
      console.error('[Animals] Erro ao salvar animal:', error)
      // Não fechar o formulário em caso de erro para que o usuário possa tentar novamente
      throw error // Re-throw para que o formulário possa tratar o erro
    }
  }

  const handleEdit = (animal: Animal) => {
    console.log('[Animals] Editando animal:', animal.id)
    setEditingAnimal(animal)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    console.log('[Animals] Solicitação de remoção do animal:', id)
    
    if (window.confirm('Tem certeza que deseja remover este animal?')) {
      try {
        console.log('[Animals] Confirmado - removendo animal:', id)
        await remove(id)
        console.log('[Animals] Animal removido com sucesso')
        
        // Recarregar dados após remoção
        await reload()
        
      } catch (error) {
        console.error('[Animals] Erro ao remover animal:', error)
        alert('Erro ao remover animal. Tente novamente.')
      }
    } else {
      console.log('[Animals] Remoção cancelada pelo usuário')
    }
  }

  const handleAddNew = () => {
    console.log('[Animals] Abrindo formulário para novo animal')
    setEditingAnimal(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    console.log('[Animals] Cancelando formulário')
    setShowForm(false)
    setEditingAnimal(null)
  }

  // Função de debug para resetar dados
  const handleResetData = () => {
    console.log('[Animals] RESET: Limpando localStorage e recarregando')
    localStorage.removeItem('animals_data')
    reload()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'vendido':
        return 'bg-blue-100 text-blue-800'
      case 'morto':
        return 'bg-red-100 text-red-800'
      case 'descarte':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'saudável':
      case 'saudavel':
        return 'bg-green-100 text-green-800'
      case 'tratamento':
        return 'bg-yellow-100 text-yellow-800'
      case 'doente':
        return 'bg-red-100 text-red-800'
      case 'quarentena':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    console.error('[Animals] Renderizando estado de erro:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  console.log('[Animals] Tentativa de recarregar dados após erro')
                  reload()
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={handleResetData}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset Dados
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('[Animals] Renderizando página principal')

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Animais</h1>
                <p className="text-gray-600">Controle completo do seu rebanho</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleResetData}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                title="Reset dados (Debug)"
              >
                <RefreshCw size={16} />
                <span>Reset</span>
              </button>
              <button
                onClick={handleAddNew}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Adicionar Animal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por ID, nome, espécie ou raça..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="vendido">Vendido</option>
                <option value="morto">Morto</option>
                <option value="descarte">Descarte</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total de Animais */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Animais</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.totalAnimals}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Média de Arrobas Carcaça */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Arrobas Carcaça</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.mediaArrobasCarcaca}</p>
                <p className="text-xs text-gray-500">@/animal</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Peso Total do Rebanho */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso Total</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {animals.reduce((total, animal) => total + (animal.weight || 0), 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Valor Total Investido */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Investido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metrics.valorTotalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Animals List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Animais ({filteredAnimals.length})
              </h3>
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando animais...</p>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="p-8 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum animal encontrado</h3>
              <p className="text-gray-600 mb-4">
                {animals.length === 0 
                  ? "Comece adicionando seu primeiro animal ao rebanho."
                  : "Tente ajustar os filtros de busca."
                }
              </p>
              {animals.length === 0 && (
                <button
                  onClick={handleAddNew}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Adicionar Primeiro Animal
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID / Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raça / Sexo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nascimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arroba P.V.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arroba Carcaça
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compra
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnimals.map((animal) => {
                    const arrobaPesoVivo = animal.weight ? (animal.weight / 15).toFixed(2) : '0.00'
                    const arrobasCarcaca = animal.weight ? ((animal.weight * 0.5) / 15).toFixed(2) : '0.00'
                    
                    return (
                      <tr key={animal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{animal.animalId}</div>
                            <div className="text-sm text-gray-500">{animal.name || '-'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{animal.breed}</div>
                          <div className="text-sm text-gray-500 capitalize">{animal.gender}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {animal.weight || 0} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {arrobaPesoVivo} @
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {arrobasCarcaca} @
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(animal.status)}`}>
                              {animal.status}
                            </span>
                            {animal.healthStatus && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(animal.healthStatus)}`}>
                                {animal.healthStatus}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {animal.purchasePrice ? `R$ ${animal.purchasePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {animal.purchaseDate ? new Date(animal.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(animal)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(animal.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Animal Form Modal */}
        {showForm && (
          <AnimalForm
            animal={editingAnimal}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            isOpen={showForm}
          />
        )}
      </div>
    </div>
  )
}

export default Animals
