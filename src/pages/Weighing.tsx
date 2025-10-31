import React, { useState, useMemo, useCallback } from 'react';
import { Scale, Search, TrendingUp, Plus, History, Weight, BarChart3 } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';

// ----------------------------------------------------
// INTERFACES (Alinhadas ao MongoDB/useCRUD)
// ----------------------------------------------------
interface Animal {
    id: string;
    animalId: string;
    name: string;
    species: string;
    breed: string;
    birthDate: string;
    gender: string;
    weight: number;
    status: string;
    healthStatus: string;
    location: string;
    purchasePrice?: number;
    purchaseDate?: string;
    notes?: string;
    created_at?: string; 
    // weighingHistory removido: a fonte de verdade é a coleção 'weighing_records'
}

interface WeighingRecord {
    // Usamos 'any' na data para lidar com o formato { $date: string } do MongoDB, 
    // mas tratamos ela como string no código.
    id: string; 
    animalId: string;
    weight: number;
    date: any; // Mantemos 'any' para flexibilidade com o formato Mongo
    notes?: string;
    measuredBy: string;
    location?: string;
    purpose?: string;
    created_at: any; 
}

const getWeightTrend = (current: number, previous: number | undefined) => {
    if (!previous) return 'neutral';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
};

const getTrendColor = (trend: string) => {
    switch (trend) {
        case 'up': return 'text-green-600 dark:text-green-400';
        case 'down': return 'text-red-600 dark:text-red-400';
        default: return 'text-gray-600 dark:text-gray-400';
    }
};

const Weighing: React.FC = () => {
    // 1. CHAMA HOOKS E FUNÇÕES CRUD
    const { 
        data: animals, 
        loading: animalsLoading, 
        updateRecord: updateAnimalRecord 
    } = useCRUD<Animal>('animals');

    const { 
        data: weighings, 
        loading: weighingsLoading, 
        createRecord: createWeighingRecord,
        reload: reloadWeighings 
    } = useCRUD<WeighingRecord>('weighing_records');

    // 2. ESTADO LOCAL
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showWeighingForm, setShowWeighingForm] = useState(false);
    
    // Estado do Formulário
    const [weighingData, setWeighingData] = useState({
        weight: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        measuredBy: 'Operador',
        location: '',
        purpose: 'controle'
    });


    const normalizeDate = (date: any): string => {
        if (typeof date === 'string') return date;
        // Lida com o formato MongoDB: { $date: "2025-09-15T00:00:00.000+00:00" }
        if (date && typeof date === 'object' && date.$date) return date.$date; 
        // Fallback seguro para garantir que não seja null
        return new Date().toISOString(); 
    };

    // 3. FILTRAGEM E ORDENAÇÃO DE DADOS (animalWeighings)
    const filteredAnimals = animals.filter(animal => 
        animal.animalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  

    const animalWeighings = useMemo(() => {
        if (!selectedAnimal || !weighings || weighings.length === 0) return [];
        
        // 1. FILTRA, NORMALIZA a data e cria uma cópia segura
        const recordsForAnimal = weighings
            .filter(w => w.animalId === selectedAnimal.animalId)
            .map(w => ({
                ...w,
                // Sobrescreve a data com a string ISO garantida
                date: normalizeDate(w.date), 
            }));

        // 2. ORDENA a cópia pela data normalizada (mais recente primeiro)
        return recordsForAnimal
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [weighings, selectedAnimal]);


    // 4. ESTATÍSTICAS E CÁLCULOS (animalStats)
    const animalStats = useMemo(() => {
        // Se não houver histórico, use o peso atual da coleção 'animals'
        if (animalWeighings.length === 0) {
            if (!selectedAnimal) return null;
            return {
                currentWeight: selectedAnimal.weight,
                previousWeight: undefined,
                weightGain: 0,
                avgDailyGain: 0,
                minWeight: selectedAnimal.weight,
                maxWeight: selectedAnimal.weight,
                totalWeighings: 0
            }
        }
        
        const weights = animalWeighings.map(w => w.weight).sort((a, b) => a - b);
        const currentWeight = animalWeighings[0].weight; 
        const previousWeighing = animalWeighings[1];
        const previousWeight = previousWeighing?.weight;
        const weightGain = previousWeight ? currentWeight - previousWeight : 0;
        
        let avgDailyGain = 0;

        if (animalWeighings.length >= 2) {
            const firstWeighing = animalWeighings[animalWeighings.length - 1];
            const lastWeighing = animalWeighings[0];
            
            // As datas são strings ISO válidas aqui
            const firstDate = new Date(firstWeighing.date);
            const lastDate = new Date(lastWeighing.date);
            
            const daysDiff = Math.abs(lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
            avgDailyGain = daysDiff > 0 ? (lastWeighing.weight - firstWeighing.weight) / daysDiff : 0;
        }
        
        return {
            currentWeight, previousWeight, weightGain, avgDailyGain,
            minWeight: Math.min(...weights), maxWeight: Math.max(...weights),
            totalWeighings: animalWeighings.length
        };
    }, [selectedAnimal, animalWeighings]);


    // 5. FUNÇÃO DE SUBMISSÃO (Sincronização com o Animal Principal)
    const handleWeighingSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAnimal || !weighingData.weight) {
            alert('Selecione um animal e informe o peso');
            return;
        }

        const novoPeso = parseFloat(weighingData.weight);

        try {
            // 1. DADOS DA NOVA PESAGEM
            const newWeighing = {
                animalId: selectedAnimal.animalId,
                weight: novoPeso,
                // Usar a data completa para garantir que o MongoDB registre o timestamp
                date: new Date(weighingData.date).toISOString(), 
                notes: weighingData.notes.trim(),
                measuredBy: weighingData.measuredBy.trim(),
                location: weighingData.location.trim(),
                purpose: weighingData.purpose
            };

            // 2. CRIA O NOVO REGISTRO NA COLEÇÃO EXTERNA
            await createWeighingRecord(newWeighing);
            
            // 3. SINCRONIZA O PESO NA COLEÇÃO DE ANIMAIS (Atualiza o peso principal)
            await updateAnimalRecord(selectedAnimal.id, { 
                weight: novoPeso,
                updatedAt: new Date().toISOString()
            });
            
            // 4. Recarrega os dados de pesagem (para atualizar o histórico na UI)
            await reloadWeighings(); 
            
            // 5. Limpeza de estado
            setWeighingData({ weight: '', date: new Date().toISOString().split('T')[0], notes: '', measuredBy: 'Operador', location: '', purpose: 'controle' });
            setShowWeighingForm(false);
            alert(`Pesagem de ${novoPeso} kg registrada com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao registrar pesagem:', error);
            alert('Erro ao registrar pesagem. Verifique o console para mais detalhes.');
        }
    }, [selectedAnimal, weighingData, createWeighingRecord, updateAnimalRecord, reloadWeighings]);
    

  // ✅ CORREÇÃO: Verifique se há dados no console
  React.useEffect(() => {

  }, [weighings, selectedAnimal, animalWeighings]);

  if (animalsLoading || weighingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pesagem de Animais</h1>
              <p className="text-gray-600 dark:text-gray-300">Controle de peso e histórico do rebanho</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Seleção de Animal */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecionar Animal</h3>
              
              {/* Busca */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por ID, nome ou raça..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Lista de Animais */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => setSelectedAnimal(animal)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnimal?.id === animal.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{animal.animalId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{animal.name || '-'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{animal.breed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{animal.weight} kg</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Peso atual</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {!selectedAnimal ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Selecione um Animal</h3>
                <p className="text-gray-600 dark:text-gray-300">Escolha um animal da lista para ver o histórico de pesagem e registrar novo peso</p>
              </div>
            ) : (
              <>
                {/* Informações do Animal */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAnimal.animalId}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedAnimal.name || 'Sem nome'} - {selectedAnimal.breed}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedAnimal.gender} • {selectedAnimal.species}</p>
                    </div>
                    <button
                      onClick={() => setShowWeighingForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Nova Pesagem</span>
                    </button>
                  </div>

                  {/* ✅ CORREÇÃO: Mostra estatísticas mesmo sem histórico */}
                  {animalStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* ... (código das estatísticas permanece igual) */}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Nenhum histórico de pesagem encontrado para este animal
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Histórico de Pesagens */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Histórico de Pesagens {animalWeighings.length > 0 && `(${animalWeighings.length})`}
                    </h3>
                  </div>

                  {animalWeighings.length === 0 ? (
                    <div className="p-8 text-center">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhuma pesagem registrada</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Registre a primeira pesagem deste animal</p>
                      <button
                        onClick={() => setShowWeighingForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Registrar Primeira Pesagem
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Variação</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Propósito</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Responsável</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Observações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {animalWeighings.map((weighing, index) => {
                            const previousWeighing = animalWeighings[index + 1];
                            const weightDiff = previousWeighing ? weighing.weight - previousWeighing.weight : 0;
                            const trend = getWeightTrend(weighing.weight, previousWeighing?.weight);
                            
                            return (
                              <tr key={weighing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {new Date(weighing.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{weighing.weight} kg</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {previousWeighing ? (
                                    <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                                      {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
                                    {weighing.purpose}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {weighing.measuredBy}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                  {weighing.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal de Nova Pesagem (código permanece igual) */}
        {showWeighingForm && selectedAnimal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nova Pesagem</h2>
                                <button
                                    onClick={() => setShowWeighingForm(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleWeighingSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Animal: {selectedAnimal.animalId}
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAnimal.name || 'Sem nome'} - {selectedAnimal.breed}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Peso (kg) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={weighingData.weight}
                                        onChange={(e) => setWeighingData(prev => ({ ...prev, weight: e.target.value }))}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Ex: 450.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        value={weighingData.date}
                                        onChange={(e) => setWeighingData(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Propósito
                                    </label>
                                    <select
                                        value={weighingData.purpose}
                                        onChange={(e) => setWeighingData(prev => ({ ...prev, purpose: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="controle">Controle</option>
                                        <option value="venda">Pré-venda</option>
                                        <option value="tratamento">Tratamento</option>
                                        <option value="manejo">Manejo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Responsável
                                    </label>
                                    <input
                                        type="text"
                                        value={weighingData.measuredBy}
                                        onChange={(e) => setWeighingData(prev => ({ ...prev, measuredBy: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Nome do responsável"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Local
                                    </label>
                                    <input
                                        type="text"
                                        value={weighingData.location}
                                        onChange={(e) => setWeighingData(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Local da pesagem"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Observações
                                    </label>
                                    <textarea
                                        value={weighingData.notes}
                                        onChange={(e) => setWeighingData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Observações sobre a pesagem..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowWeighingForm(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Scale size={20} />
                                        <span>Registrar Pesagem</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

        </div>
    </div>
  );
};

export default Weighing;



