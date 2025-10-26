
import React, { useState, useEffect } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import {Plus, Search, Filter, DollarSign, TrendingUp, TrendingDown, Calendar, Edit2, Trash2, AlertCircle} from 'lucide-react'

interface FinancialTransaction {
  _id?: string
  transactionId: string
  type: 'receita' | 'despesa'
  category: string
  subcategory: string
  amount: number
  description: string
  date: string
  paymentMethod: string
  status: 'pendente' | 'pago' | 'cancelado'
  relatedEntity?: string
  relatedEntityId?: string
  tags: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string
}

const Financial: React.FC = () => {
  const { data: transactions, loading, error, createRecord, updateRecord, deleteRecord, reload } = useCRUD<FinancialTransaction>('financial_transactions')
  
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'pago' | 'cancelado'>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [submitLoading, setSubmitLoading] = useState(false)

  const [formData, setFormData] = useState<Omit<FinancialTransaction, '_id'>>({
    transactionId: '',
    type: 'receita',
    category: '',
    subcategory: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'dinheiro',
    status: 'pendente',
    relatedEntity: '',
    relatedEntityId: '',
    tags: [],
    notes: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const categories = {
    receita: {
      'venda-animais':  ['Novilha', 'Novilho', 'Touro', 'Vaca'],
      'produtos-lacteos': ['Leite', 'Queijo', 'Manteiga', 'Iogurte'],
      'servicos': ['Inseminação', 'Consultorias', 'Aluguel de Pastos'],
      'subsidios': ['Governo Federal', 'Governo Estadual', 'Municipal'],
      'outros': ['Investimentos', 'Vendas Diversas']
    },
    despesa: {
      'alimentacao': ['Ração', 'Suplementos', 'Sal Mineral', 'Feno'],
      'veterinaria': ['Medicamentos', 'Vacinas', 'Consultas', 'Cirurgias'],
      'manutencao': ['Equipamentos', 'Cercas', 'Instalações', 'Veículos'],
      'mao-de-obra': ['Salários', 'Benefícios', 'Terceirizados'],
      'impostos': ['ITR', 'ICMS', 'Contribuições'],
      'combustivel': ['Diesel', 'Gasolina', 'Óleo'],
      'compra_animais': ['Novilha', 'Novilho', 'Touro', 'Vaca'],
      'outros': ['Seguros', 'Financiamentos', 'Despesas Gerais']
    }
  }

  const paymentMethods = ['dinheiro', 'pix', 'cartao-debito', 'cartao-credito', 'transferencia', 'cheque', 'boleto']

  const generateTransactionId = () => {
    const prefix = formData.type === 'receita' ? 'REC' : 'DES'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.category.trim()) errors.category = 'Categoria é obrigatória'
    if (!formData.subcategory.trim()) errors.subcategory = 'Subcategoria é obrigatória'
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Valor deve ser maior que zero'
    if (!formData.description.trim()) errors.description = 'Descrição é obrigatória'
    if (!formData.date) errors.date = 'Data é obrigatória'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      console.log('Validação do formulário falhou:', formErrors)
      return
    }

    setSubmitLoading(true)
    console.log('Iniciando salvamento da transação...')

    try {
      const transactionData = {
        ...formData,
        transactionId: editingTransaction ? editingTransaction.transactionId : generateTransactionId(),
        amount: Number(formData.amount),
        tags: Array.isArray(formData.tags) 
          ? formData.tags 
          : typeof formData.tags === 'string' 
            ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) 
            : [],
        description: formData.description.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim(),
        notes: formData.notes?.trim() || ''
      }

      console.log('Dados da transação preparados:', transactionData)

      if (editingTransaction) {
        console.log('Atualizando transação existente...')
        await updateRecord(editingTransaction._id!, transactionData)
        console.log('Transação atualizada com sucesso')
      } else {
        console.log('Criando nova transação...')
        const result = await createRecord(transactionData)
        console.log('Transação criada com sucesso:', result)
      }

      // Resetar formulário e fechar
      resetForm()
      setShowForm(false)
      
      // Recarregar dados para garantir sincronização
      console.log('Recarregando dados...')
      await reload()
      console.log('Dados recarregados com sucesso')

    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      
      let errorMessage = 'Erro ao salvar transação. Tente novamente.'
      if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setSubmitLoading(false)
    }
  }

  const resetForm = () => {
    console.log('Resetando formulário...')
    setFormData({
      transactionId: '',
      type: 'receita',
      category: '',
      subcategory: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'dinheiro',
      status: 'pendente',
      relatedEntity: '',
      relatedEntityId: '',
      tags: [],
      notes: ''
    })
    setEditingTransaction(null)
    setFormErrors({})
  }

  const handleEdit = (transaction: FinancialTransaction) => {
    console.log('Editando transação:', transaction)
    setEditingTransaction(transaction)
    setFormData({
      transactionId: transaction.transactionId,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      relatedEntity: transaction.relatedEntity || '',
      relatedEntityId: transaction.relatedEntityId || '',
      tags: transaction.tags || [],
      notes: transaction.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        console.log('Excluindo transação:', id)
        await deleteRecord(id)
        await reload()
        console.log('Transação excluída com sucesso')
      } catch (error) {
        console.error('Erro ao excluir transação:', error)
        alert('Erro ao excluir transação. Tente novamente.')
      }
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus
    const matchesDateRange = (!dateRange.start || transaction.date >= dateRange.start) &&
                            (!dateRange.end || transaction.date <= dateRange.end)

    return matchesSearch && matchesType && matchesStatus && matchesDateRange
  })

  // Cálculos financeiros
  const totalReceitas = transactions
    .filter(t => t.type === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0)

  const saldoAtual = totalReceitas - totalDespesas

  const receitasPendentes = transactions
    .filter(t => t.type === 'receita' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.amount, 0)

  const despesasPendentes = transactions
    .filter(t => t.type === 'despesa' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={reload}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="mt-2 text-gray-600">Controle completo das receitas e despesas da propriedade</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Receitas</p>
                <p className="text-2xl font-semibold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Despesas</p>
                <p className="text-2xl font-semibold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className={`h-8 w-8 ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saldo Atual</p>
                <p className={`text-2xl font-semibold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-lg font-semibold text-gray-900">
                  <span className="text-green-600">+R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <br />
                  <span className="text-red-600">-R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Transação
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        type: e.target.value as 'receita' | 'despesa',
                        category: '',
                        subcategory: ''
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        category: e.target.value,
                        subcategoria: ''
                      }))
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {Object.keys(categories[formData.type]).map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoria *</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    disabled={!formData.category}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.subcategory ? 'border-red-500' : 'border-gray-300'
                    } ${!formData.category ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Selecione uma subcategoria</option>
                    {formData.category && categories[formData.type][formData.category]?.map(subcat => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                  {formErrors.subcategory && <p className="text-red-500 text-sm mt-1">{formErrors.subcategory}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                  />
                  {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method.charAt(0).toUpperCase() + method.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Descrição da transação"
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Observações adicionais sobre a transação"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  disabled={submitLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {submitLoading ? 'Salvando...' : (editingTransaction ? 'Atualizar' : 'Salvar')} Transação
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Transações */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Transações ({filteredTransactions.length})
            </h2>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                {transactions.length === 0 
                  ? "Nenhuma transação cadastrada. Clique em 'Nova Transação' para começar."
                  : "Nenhuma transação encontrada com os filtros aplicados."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID / Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo / Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.transactionId}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'receita' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {transaction.category} / {transaction.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'receita' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'pago' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'pago' ? 'Pago' : 
                           transaction.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar transação"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id!)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir transação"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Financial
