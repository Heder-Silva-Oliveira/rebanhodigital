
import React, { useState, useEffect } from 'react'
import {X, Save, AlertCircle} from 'lucide-react'

interface Animal {
  _id?: string
  animalId: string
  name: string
  species: string
  breed: string
  birthDate: string
  gender: string
  weight?: number
  status: string
  healthStatus?: string
  location?: string
  motherId?: string
  fatherId?: string
  purchasePrice?: number
  purchaseDate?: string
  notes?: string
}

interface AnimalFormProps {
  animal?: Animal | null
  onSubmit: (data: Omit<Animal, '_id'>) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

const AnimalForm: React.FC<AnimalFormProps> = ({ animal, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<Omit<Animal, '_id'>>({
    animalId: '',
    name: '',
    species: 'bovino',
    breed: '',
    birthDate: '',
    gender: 'femea',
    weight: 0,
    status: 'ativo',
    healthStatus: 'saudavel',
    location: '',
    motherId: '',
    fatherId: '',
    purchasePrice: 0,
    purchaseDate: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Cálculos automáticos das arrobas
  const arrobaPesoVivo = formData.weight ? (formData.weight / 15).toFixed(2) : '0.00'
  const arrobaCarcaca = formData.weight ? ((formData.weight * 0.5) / 15).toFixed(2) : '0.00'

  useEffect(() => {
    console.log('[AnimalForm] Inicializando formulário. Animal:', animal)
    
    if (animal) {
      console.log('[AnimalForm] Editando animal existente')
      setFormData({
        animalId: animal.animalId || '',
        name: animal.name || '',
        species: animal.species || 'bovino',
        breed: animal.breed || '',
        birthDate: animal.birthDate?.split('T')[0] || '',
        gender: animal.gender || 'femea',
        weight: animal.weight || 0,
        status: animal.status || 'ativo',
        healthStatus: animal.healthStatus || 'saudavel',
        location: animal.location || '',
        motherId: animal.motherId || '',
        fatherId: animal.fatherId || '',
        purchasePrice: animal.purchasePrice || 0,
        purchaseDate: animal.purchaseDate?.split('T')[0] || '',
        notes: animal.notes || ''
      })
    } else {
      console.log('[AnimalForm] Criando novo animal')
      // Gerar ID único para novo animal
      const newId = `A${Date.now().toString().slice(-6)}`
      console.log('[AnimalForm] ID gerado para novo animal:', newId)
      setFormData(prev => ({ 
        ...prev, 
        animalId: newId,
        name: '',
        breed: '',
        birthDate: '',
        weight: 0,
        purchasePrice: 0,
        purchaseDate: '',
        location: '',
        motherId: '',
        fatherId: '',
        notes: ''
      }))
    }
    setSubmitError(null)
  }, [animal])

  const validateForm = () => {
    console.log('[AnimalForm] Validando formulário:', formData)
    const errors: string[] = []

    if (!formData.animalId?.trim()) errors.push('ID é obrigatório')
    if (!formData.breed?.trim()) errors.push('Raça é obrigatória')
    if (!formData.birthDate) errors.push('Data de nascimento é obrigatória')
    if (!formData.purchaseDate) errors.push('Data de compra é obrigatória')
    if (!formData.weight || formData.weight <= 0) errors.push('Peso deve ser maior que zero')
    if (formData.purchasePrice === undefined || formData.purchasePrice < 0) errors.push('Preço de compra deve ser positivo')

    console.log('[AnimalForm] Erros de validação:', errors)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[AnimalForm] Iniciando submissão do formulário')
    setSubmitError(null)

    // Validar formulário
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      const errorMessage = `Erros de validação: ${validationErrors.join(', ')}`
      console.error('[AnimalForm] Erros de validação:', errorMessage)
      setSubmitError(errorMessage)
      return
    }

    setLoading(true)
    console.log('[AnimalForm] Iniciando processo de salvamento...')

    try {
      const submitData = {
        ...formData,
        // Garantir que campos numéricos sejam números
        weight: Number(formData.weight) || 0,
        purchasePrice: Number(formData.purchasePrice) || 0,
        // Converter datas para ISO string se não estiverem vazias
        birthDate: formData.birthDate ? new Date(formData.birthDate + 'T00:00:00.000Z').toISOString() : '',
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate + 'T00:00:00.000Z').toISOString() : '',
        // Limpar campos de texto
        name: formData.name?.trim() || '',
        breed: formData.breed?.trim() || '',
        location: formData.location?.trim() || '',
        motherId: formData.motherId?.trim() || '',
        fatherId: formData.fatherId?.trim() || '',
        notes: formData.notes?.trim() || ''
      }
      
      console.log('[AnimalForm] Dados preparados para envio:', submitData)
      
      await onSubmit(submitData)
      console.log('[AnimalForm] Animal salvo com sucesso!')
      
      // Fechar modal apenas se o salvamento foi bem-sucedido
      onCancel()
      
    } catch (error) {
      console.error('[AnimalForm] Erro ao salvar animal:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar animal'
      setSubmitError(errorMessage)
    } finally {
      setLoading(false)
      console.log('[AnimalForm] Processo de salvamento finalizado')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`[AnimalForm] Campo alterado: ${name} = ${value}`)
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro quando o usuário começar a digitar
    if (submitError) {
      console.log('[AnimalForm] Limpando erro de submissão')
      setSubmitError(null)
    }
  }

  if (!isOpen) return null

  console.log('[AnimalForm] Renderizando formulário. Loading:', loading, 'Error:', submitError)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {animal ? 'Editar Animal' : 'Novo Animal'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Erro ao salvar</h4>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campos Obrigatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <input
                type="text"
                name="animalId"
                value={formData.animalId}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: A123456"
              />
            </div>

            {/* Raça */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raça * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Nelore, Angus, Brahman"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="femea">Fêmea</option>
                <option value="macho">Macho</option>
              </select>
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg) * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 450"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ativo">Ativo</option>
                <option value="vendido">Vendido</option>
                <option value="morto">Morto</option>
                <option value="descarte">Descarte</option>
              </select>
            </div>

            {/* Preço de Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Compra (R$) * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 1800.00"
              />
            </div>

            {/* Data de Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Compra * <span className="text-xs text-gray-500">(obrigatório)</span>
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Arroba Peso Vivo (calculado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arroba Peso Vivo <span className="text-xs text-gray-500">(calculado automaticamente)</span>
              </label>
              <input
                type="text"
                value={`${arrobaPesoVivo} @`}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Arroba Carcaça (calculado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arroba Carcaça <span className="text-xs text-gray-500">(calculado automaticamente)</span>
              </label>
              <input
                type="text"
                value={`${arrobaCarcaca} @`}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Campos Opcionais */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do animal (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Espécie
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="bovino">Bovino</option>
                  <option value="suino">Suíno</option>
                  <option value="ovino">Ovino</option>
                  <option value="caprino">Caprino</option>
                  <option value="equino">Equino</option>
                  <option value="aves">Aves</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status de Saúde
                </label>
                <select
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="saudavel">Saudável</option>
                  <option value="doente">Doente</option>
                  <option value="tratamento">Em Tratamento</option>
                  <option value="quarentena">Quarentena</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Pasto/Curral"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID da Mãe
                </label>
                <input
                  type="text"
                  name="motherId"
                  value={formData.motherId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ID da mãe (se conhecido)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Pai
                </label>
                <input
                  type="text"
                  name="fatherId"
                  value={formData.fatherId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ID do pai (se conhecido)"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Observações gerais sobre o animal..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{loading ? 'Salvando...' : 'Salvar Animal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AnimalForm
