import React, { useState, useMemo } from 'react'
import { useCRUD } from '../hooks/useCRUD'
import {Calendar, Clock, CheckCircle, AlertCircle, Plus, Edit, Trash2, Filter, Loader2} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface PlanningItem {
 id: string
 planId: string
 title: string
 description: string
 type: string
 startDate: string
 endDate: string
 status: string
 priority: string
 assignedTo: string
 relatedAnimals: string[]
 relatedPastures: string[]
 estimatedCost: number
 actualCost: number
 completionPercentage: number
 notes: string
}

type PlanningData = Omit<PlanningItem, 'id'>

const Planning: React.FC = () => {
    
  // CORREÇÃO A: Estabilizar o objeto de opções com useMemo
  const crudOptions = useMemo(() => ({
      entityName: 'planning',
      sortBy: { startDate: 1 }
  }), []); // Array de dependências vazio: o objeto NUNCA muda.
    
   const { data: plans, loading, createRecord, updateRecord, deleteRecord } = useCRUD<PlanningItem>(crudOptions)

   const [showForm, setShowForm] = useState(false)
   const [editingPlan, setEditingPlan] = useState<PlanningItem | null>(null)
   const [filterType, setFilterType] = useState('')
   const [filterStatus, setFilterStatus] = useState('')
   const [filterPriority, setFilterPriority] = useState('')
   const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

   const types = ['vacinacao', 'reproducao', 'manejo', 'alimentacao', 'manutencao', 'vendas', 'compras', 'pesagem', 'outros']
   const statuses = ['planejado', 'em_andamento', 'concluido', 'cancelado', 'adiado']
   const priorities = ['baixa', 'media', 'alta', 'urgente']

   // Filtrar planos (melhor performance com useMemo)
   const filteredPlans = useMemo(() => {
        return plans.filter(plan => {
            const matchesType = !filterType || plan.type === filterType
            const matchesStatus = !filterStatus || plan.status === filterStatus
            const matchesPriority = !filterPriority || plan.priority === filterPriority
            return matchesType && matchesStatus && matchesPriority
        })
    }, [plans, filterType, filterStatus, filterPriority]); // Depende dos filtros e dos planos
    

   // CORREÇÃO B: Encapsular Estatísticas
   const stats = useMemo(() => {
        const today = new Date();
        const totalPlans = plans.length
        const activePlans = plans.filter(plan => plan.status === 'em_andamento').length
        const completedPlans = plans.filter(plan => plan.status === 'concluido').length
        const overduePlans = plans.filter(plan => {
            // Cria new Date() APENAS DENTRO do useMemo, quando 'plans' muda
            return plan.status !== 'concluido' && new Date(plan.endDate) < today
        }).length
        
        return { totalPlans, activePlans, completedPlans, overduePlans };
    }, [plans]);

   // Desestruturando o stats para usar no JSX
    const { totalPlans, activePlans, completedPlans, overduePlans } = stats;


   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const baseData: PlanningData = {
     planId: (formData.get('planId') as string) || `PLAN${Date.now().toString().slice(-6)}`,
     title: formData.get('title') as string,
     description: formData.get('description') as string,
     type: formData.get('type') as string,
     startDate: new Date(formData.get('startDate') as string).toISOString(),
     endDate: new Date(formData.get('endDate') as string).toISOString(),
     status: formData.get('status') as string,
     priority: formData.get('priority') as string,
     assignedTo: formData.get('assignedTo') as string,
     relatedAnimals: (formData.get('relatedAnimals') as string)?.split(',').map(id => id.trim()).filter(id => id) || [],
     relatedPastures: (formData.get('relatedPastures') as string)?.split(',').map(id => id.trim()).filter(id => id) || [],
     estimatedCost: Number(formData.get('estimatedCost')),
     actualCost: Number(formData.get('actualCost')) || 0,
     completionPercentage: Number(formData.get('completionPercentage')) || 0,
     notes: formData.get('notes') as string,
    }

    try {
     if (editingPlan) {
      await updateRecord(editingPlan.id, baseData) 
      toast.success('Planejamento atualizado com sucesso!')
     } else {
      await createRecord(baseData)
      toast.success('Planejamento criado com sucesso!')
     }
     setShowForm(false)
     setEditingPlan(null)
    } catch (error) {
     toast.error('Erro ao salvar planejamento')
    }
   }

   const handleEdit = (plan: PlanningItem) => {
    setEditingPlan(plan)
    setShowForm(true)
   }

   const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
     try {
      await deleteRecord(id)
      toast.success('Planejamento excluído com sucesso!')
     } catch (error) {
      toast.error('Erro ao excluir planejamento')
     }
    }
   }

   const getStatusColor = (status: string) => {
    switch (status) {
     case 'planejado': return 'bg-blue-100 text-blue-800'
     case 'em_andamento': return 'bg-yellow-100 text-yellow-800'
     case 'concluido': return 'bg-green-100 text-green-800'
     case 'cancelado': return 'bg-red-100 text-red-800'
     case 'adiado': return 'bg-orange-100 text-orange-800'
     default: return 'bg-gray-100 text-gray-800'
    }
   }

   const getPriorityColor = (priority: string) => {
    switch (priority) {
     case 'baixa': return 'bg-gray-100 text-gray-800'
     case 'media': return 'bg-blue-100 text-blue-800'
     case 'alta': return 'bg-yellow-100 text-yellow-800'
     case 'urgente': return 'bg-red-100 text-red-800'
     default: return 'bg-gray-100 text-gray-800'
    }
   }

    // Simplificado, pois a lógica de data já foi encapsulada no useMemo
   const isOverdue = (endDate: string, status: string) => {
    return status !== 'concluido' && new Date(endDate) < new Date()
   }


   if (loading) {
    return (
     <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin h-12 w-12 text-green-600" /> 
     {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div> */}
     </div>
    )
   }
    
    // ... restante do JSX (mantido, pois as correções estão no JS/TS)

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-screen-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Calendar className="mr-3 text-green-600" size={36} />
                                Planejamento de Atividades
                            </h1>
                            <p className="text-gray-600 mt-2">Organize e acompanhe todas as atividades da fazenda</p>
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex bg-white rounded-lg shadow-sm">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-l-lg ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Lista
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-4 py-2 rounded-r-lg ${viewMode === 'calendar' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Calendário
                                </button>
                            </div>
                            <button
                                onClick={() => { setEditingPlan(null); setShowForm(true) }}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
                            >
                                <Plus size={20} className="mr-2" />
                                Nova Atividade
                            </button>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <Calendar className="text-blue-600" size={24} />
                                <div className="ml-4">
                                    <p className="text-gray-600 text-sm">Total de Planos</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalPlans}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <Clock className="text-yellow-600" size={24} />
                                <div className="ml-4">
                                    <p className="text-gray-600 text-sm">Em Andamento</p>
                                    <p className="text-2xl font-bold text-yellow-600">{activePlans}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <CheckCircle className="text-green-600" size={24} />
                                <div className="ml-4">
                                    <p className="text-gray-600 text-sm">Concluídos</p>
                                    <p className="text-2xl font-bold text-green-600">{completedPlans}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <AlertCircle className="text-red-600" size={24} />
                                <div className="ml-4">
                                    <p className="text-gray-600 text-sm">Atrasados</p>
                                    <p className="text-2xl font-bold text-red-600">{overduePlans}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    setFilterStatus('')
                                    setFilterPriority('')
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                                <Filter size={20} className="mr-2" />
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Planejamentos */}
                {viewMode === 'list' && (
                    <div className="space-y-4">
                        {filteredPlans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                                                {plan.status.replace('_', ' ')}
                                            </span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(plan.priority)}`}>
                                                {plan.priority}
                                            </span>
                                            {isOverdue(plan.endDate, plan.status) && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    ATRASADO
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-gray-600 mb-3">{plan.description}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                                            <div>
                                                <span className="font-medium">Tipo:</span> {plan.type}
                                            </div>
                                            <div>
                                                <span className="font-medium">Responsável:</span> {plan.assignedTo}
                                            </div>
                                            <div>
                                                <span className="font-medium">Início:</span> {new Date(plan.startDate).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div>
                                                <span className="font-medium">Término:</span> {new Date(plan.endDate).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                        
                                        {plan.completionPercentage > 0 && (
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                                    <span>Progresso</span>
                                                    <span>{plan.completionPercentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${plan.completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-gray-500">
                                                <span className="font-medium">Custo estimado:</span> R$ {plan.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                {plan.actualCost > 0 && (
                                                    <span className="ml-4">
                                                        <span className="font-medium">Custo real:</span> R$ {plan.actualCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id, plan.title)}
                                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modal de Formulário */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    {editingPlan ? 'Editar Planejamento' : 'Nova Atividade'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            name="planId"
                                            placeholder="ID do Plano"
                                            defaultValue={editingPlan?.planId || ''}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <input
                                            name="title"
                                            placeholder="Título da Atividade"
                                            defaultValue={editingPlan?.title || ''}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <textarea
                                        name="description"
                                        placeholder="Descrição detalhada"
                                        defaultValue={editingPlan?.description || ''}
                                        rows={3}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select
                                            name="type"
                                            defaultValue={editingPlan?.type || ''}
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
                                            name="assignedTo"
                                            placeholder="Responsável"
                                            defaultValue={editingPlan?.assignedTo || ''}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            name="startDate"
                                            type="datetime-local"
                                            placeholder="Data de Início"
                                            defaultValue={editingPlan?.startDate ? editingPlan.startDate.slice(0, 16) : ''}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <input
                                            name="endDate"
                                            type="datetime-local"
                                            placeholder="Data de Término"
                                            defaultValue={editingPlan?.endDate ? editingPlan.endDate.slice(0, 16) : ''}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select
                                            name="status"
                                            defaultValue={editingPlan?.status || 'planejado'}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>
                                                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            name="priority"
                                            defaultValue={editingPlan?.priority || 'media'}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            name="estimatedCost"
                                            type="number"
                                            step="0.01"
                                            placeholder="Custo Estimado"
                                            defaultValue={editingPlan?.estimatedCost || ''}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <input
                                            name="actualCost"
                                            type="number"
                                            step="0.01"
                                            placeholder="Custo Real"
                                            defaultValue={editingPlan?.actualCost || ''}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <input
                                            name="completionPercentage"
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="% Conclusão"
                                            defaultValue={editingPlan?.completionPercentage || ''}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            name="relatedAnimals"
                                            placeholder="IDs dos Animais (separados por vírgula)"
                                            defaultValue={editingPlan?.relatedAnimals?.join(', ') || ''}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <input
                                            name="relatedPastures"
                                            placeholder="IDs das Pastagens (separados por vírgula)"
                                            defaultValue={editingPlan?.relatedPastures?.join(', ') || ''}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <textarea
                                        name="notes"
                                        placeholder="Observações"
                                        defaultValue={editingPlan?.notes || ''}
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                        >
                                            {editingPlan ? 'Atualizar Planejamento' : 'Criar Planejamento'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowForm(false); setEditingPlan(null) }}
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

export default Planning