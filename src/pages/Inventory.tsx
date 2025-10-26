
import React, { useState } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import {Package, AlertTriangle, Plus, Edit, Trash2, Search, Filter} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface InventoryItem {
  _id: string
  itemId: string
  name: string
  category: string
  subcategory: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  unitPrice: number
  supplier: string
  location: string
  expiryDate: string
  status: string
  notes: string
}

const Inventory: React.FC = () => {
  const { data: items, loading, createRecord, updateRecord, deleteRecord } = useCRUD<InventoryItem>({
    entityName: 'inventory',
    sortBy: { name: 1 }
  })

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const categories = ['medicamentos', 'racao', 'equipamentos', 'ferramentas', 'suplementos', 'outros']
  const statuses = ['disponivel', 'baixo_estoque', 'esgotado', 'vencido', 'reservado']
  const units = ['kg', 'litros', 'unidades', 'metros', 'sacas', 'doses']

  // Filtrar itens
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    const matchesStatus = !filterStatus || item.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Estatísticas
  const totalItems = items.length
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length
  const expiredItems = items.filter(item => {
    if (!item.expiryDate) return false
    return new Date(item.expiryDate) < new Date()
  }).length
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const itemData = {
      itemId: formData.get('itemId') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      subcategory: formData.get('subcategory') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      minStock: Number(formData.get('minStock')),
      maxStock: Number(formData.get('maxStock')),
      unitPrice: Number(formData.get('unitPrice')),
      supplier: formData.get('supplier') as string,
      location: formData.get('location') as string,
      expiryDate: formData.get('expiryDate') as string,
      batchNumber: formData.get('batchNumber') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
      creator: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      if (editingItem) {
        await updateRecord(editingItem._id, itemData)
        toast.success('Item atualizado com sucesso!')
      } else {
        await createRecord(itemData)
        toast.success('Item adicionado ao estoque!')
      }
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      toast.error('Erro ao salvar item')
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover "${name}" do estoque?`)) {
      try {
        await deleteRecord(id)
        toast.success('Item removido do estoque!')
      } catch (error) {
        toast.error('Erro ao remover item')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800'
      case 'baixo_estoque': return 'bg-yellow-100 text-yellow-800'
      case 'esgotado': return 'bg-red-100 text-red-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      case 'reservado': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
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
                <Package className="mr-3 text-green-600" size={36} />
                Controle de Estoque
              </h1>
              <p className="text-gray-600 mt-2">Gerencie medicamentos, rações, equipamentos e suplementos</p>
            </div>
            <button
              onClick={() => { setEditingItem(null); setShowForm(true) }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Item
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Package className="text-blue-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Total de Itens</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="text-yellow-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="text-red-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Itens Vencidos</p>
                  <p className="text-2xl font-bold text-red-600">{expiredItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Package className="text-green-600" size={24} />
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
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
              
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('')
                  setFilterStatus('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Filter size={20} className="mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.supplier}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                      <div className="text-sm text-gray-500">{item.subcategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Min: {item.minStock} | Max: {item.maxStock}
                      </div>
                      {item.quantity <= item.minStock && (
                        <div className="text-xs text-red-600 font-medium">Estoque baixo!</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.expiryDate ? (
                        <div className={`text-sm ${isExpired(item.expiryDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                          {isExpired(item.expiryDate) && (
                            <div className="text-xs text-red-600">VENCIDO</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Não se aplica</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
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
                  {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="itemId"
                      placeholder="ID do Item"
                      defaultValue={editingItem?.itemId || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="name"
                      placeholder="Nome do Item"
                      defaultValue={editingItem?.name || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="category"
                      defaultValue={editingItem?.category || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecionar Categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="subcategory"
                      placeholder="Subcategoria"
                      defaultValue={editingItem?.subcategory || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      name="quantity"
                      type="number"
                      step="0.01"
                      placeholder="Quantidade"
                      defaultValue={editingItem?.quantity || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <select
                      name="unit"
                      defaultValue={editingItem?.unit || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Unidade</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <input
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="Preço Unitário"
                      defaultValue={editingItem?.unitPrice || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="minStock"
                      type="number"
                      placeholder="Estoque Mínimo"
                      defaultValue={editingItem?.minStock || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="maxStock"
                      type="number"
                      placeholder="Estoque Máximo"
                      defaultValue={editingItem?.maxStock || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="supplier"
                      placeholder="Fornecedor"
                      defaultValue={editingItem?.supplier || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="location"
                      placeholder="Localização no Estoque"
                      defaultValue={editingItem?.location || ''}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="expiryDate"
                      type="date"
                      placeholder="Data de Validade"
                      defaultValue={editingItem?.expiryDate ? editingItem.expiryDate.split('T')[0] : ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      name="batchNumber"
                      placeholder="Número do Lote"
                      defaultValue={editingItem?.batchNumber || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    name="status"
                    defaultValue={editingItem?.status || 'disponivel'}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <textarea
                    name="notes"
                    placeholder="Observações"
                    defaultValue={editingItem?.notes || ''}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      {editingItem ? 'Atualizar Item' : 'Adicionar Item'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingItem(null) }}
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

export default Inventory
