import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Calculator, TrendingUp, DollarSign, Target, Calendar, BarChart3 } from 'lucide-react'
import { useCRUD } from '../hooks/useCRUD'

// Interfaces Mínimas (Assumindo que são importadas ou definidas)
// DENTRO DE Estimativa.tsx
interface Animal { 
    id: string; 
    animalId: string; 
    weight: number; 
    
    // CAMPO NECESSÁRIO PARA O CÁLCULO DE LUCRO/CUSTO
    purchasePrice?: number; 
}
interface FinancialTransaction { id: string; type: 'receita' | 'despesa'; status: 'pago' | 'pendente'; amount: number; date: string; }

interface EstimativaParams {
    periodo: number
    ganhoMensal: number
    precoArroba: number
    despesaMensal: number
}

interface AnimalProjection {
    id: string
    brinco: string
    pesoAtual: number
    pesoProjetado: number
    arrobas: number
    valorEstimado: number
    custoTotal: number
    lucroEstimado: number
    roi: number
}

const Estimativa: React.FC = () => {
    const { data: animals } = useCRUD<Animal>('animals');
    const { data: transactions } = useCRUD<FinancialTransaction>('financial_transactions');

    const [params, setParams] = useState<EstimativaParams>({
        periodo: 6,
        ganhoMensal: 15,
        precoArroba: 280,
        despesaMensal: 50 // Despesa Mensal P/ ANIMAL (para simulação)
    });

    const [projections, setProjections] = useState<AnimalProjection[]>([]);
    
    // Calcula a despesa média mensal TOTAL histórica da fazenda (para informação)
    const despesaMediaHistorica = useMemo(() => {
        if (!transactions || transactions.length === 0) return 0;
        
        const despesasPagas = transactions.filter(t => t.type === 'despesa' && t.status === 'pago');
        if (despesasPagas.length === 0) return 0;

        const totalCusto = despesasPagas.reduce((sum, t) => sum + t.amount, 0);
        
        // Determina o número de meses no histórico
        const dates = despesasPagas.map(t => new Date(t.date).getTime());
        const minDate = new Date(Math.min(...dates));
        
        const today = new Date();
        const totalMonths = (today.getFullYear() * 12 + today.getMonth()) - (minDate.getFullYear() * 12 + minDate.getMonth()) + 1;

        // Custo total da fazenda dividido pelo número de meses no histórico
        return totalCusto / Math.max(1, totalMonths); 

    }, [transactions]);


    const calculateProjections = useCallback(() => {
        if (!animals || animals.length === 0) {
            setProjections([]);
            return;
        }

        const newProjections: AnimalProjection[] = animals.map((animal) => {
            // Usa o 'weight' atual, com fallback
            const pesoAtual = animal.weight || 180; 
            
            const ganhoTotal = params.ganhoMensal * params.periodo;
            const pesoProjetado = pesoAtual + ganhoTotal;
            const arrobas = Math.round(pesoProjetado / 30);
            
            const valorEstimado = arrobas * params.precoArroba;
            
            // Custo Total INDIVIDUAL para o período de projeção
            const custoTotalAnimal = (animal.purchasePrice + (params.despesaMensal * params.periodo));
            
            const lucroEstimado = valorEstimado - custoTotalAnimal;
            const roi = (lucroEstimado / custoTotalAnimal) * 100;

            return {
                id: animal.id, // ID da entidade
                brinco: animal.animalId || 'N/A',
                pesoAtual,
                pesoProjetado,
                arrobas,
                valorEstimado,
                custoTotal: custoTotalAnimal,
                lucroEstimado,
                roi: isNaN(roi) || !isFinite(roi) ? 0 : roi,
            };
        });

        setProjections(newProjections);

    }, [params, animals]);

    // Efeito para recalcular automaticamente ao mudar parâmetros ou dados
    useEffect(() => {
        calculateProjections();
    }, [calculateProjections]);

    // CÁLCULO DOS TOTAIS
    const totals = useMemo(() => {
        const valorTotal = projections.reduce((sum, proj) => sum + proj.valorEstimado, 0);
        // CORRIGIDO: Soma dos custos individuais de todos os animais
        const custoTotal = projections.reduce((sum, proj) => sum + proj.custoTotal, 0);
        const lucroTotal = projections.reduce((sum, proj) => sum + proj.lucroEstimado, 0);

        return {
            valorTotal,
            custoTotal,
            lucroTotal,
            despesaMediaHistorica: despesaMediaHistorica
        };
    }, [projections, despesaMediaHistorica]);


    // Funções Auxiliares de Formatação
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const getProjectionDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + params.periodo);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-screen-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Estimativa de Valor do Rebanho
                        </h1>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span>Projeção para {getProjectionDate()}</span>
                    </div>
                </div>

                {/* Parâmetros de Cálculo */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Parâmetros de Cálculo</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Período (meses) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Período (meses)</label>
                            <input
                                type="number"
                                value={params.periodo}
                                onChange={(e) => setParams({...params, periodo: Number(e.target.value)})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                min="1" max="24"
                            />
                        </div>

                        {/* Ganho de Peso Mensal (kg) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ganho de Peso Mensal (kg)</label>
                            <input
                                type="number"
                                value={params.ganhoMensal}
                                onChange={(e) => setParams({...params, ganhoMensal: Number(e.target.value)})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                min="5" max="50"
                            />
                        </div>

                        {/* Preço da Arroba (R$) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preço da Arroba (R$)</label>
                            <input
                                type="number"
                                value={params.precoArroba}
                                onChange={(e) => setParams({...params, precoArroba: Number(e.target.value)})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                min="100" max="500"
                            />
                        </div>

                        {/* Despesa Mensal/Animal (R$) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Despesa Mensal/Animal (R$)</label>
                            <input
                                type="number"
                                value={params.despesaMensal}
                                onChange={(e) => setParams({...params, despesaMensal: Number(e.target.value)})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                min="10" max="200"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                            {/* CORRIGIDO: Usa o valor calculado e formatado */}
                            Média de despesas mensais históricas totais: {formatCurrency(totals.despesaMediaHistorica)}
                        </div>
                        <button
                            onClick={calculateProjections}
                            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Calculator className="h-5 w-5 mr-2" />
                            Calcular Projeções
                        </button>
                    </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Valor Estimado Total */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-600 rounded-lg"><DollarSign className="h-6 w-6 text-white" /></div>
                                <div className="ml-4"><h3 className="text-sm font-medium text-blue-800">Valor Estimado Total</h3></div>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-blue-900">
                            {formatCurrency(totals.valorTotal)}
                        </p>
                    </div>

                    {/* Custo Total */}
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-600 rounded-lg"><Target className="h-6 w-6 text-white" /></div>
                                <div className="ml-4"><h3 className="text-sm font-medium text-red-800">Custo Total Projetado</h3></div>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-red-900">
                            {formatCurrency(totals.custoTotal)}
                        </p>
                    </div>

                    {/* Lucro Estimado */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-600 rounded-lg"><TrendingUp className="h-6 w-6 text-white" /></div>
                                <div className="ml-4"><h3 className="text-sm font-medium text-green-800">Lucro Estimado</h3></div>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-green-900">
                            {formatCurrency(totals.lucroTotal)}
                        </p>
                    </div>
                </div>

                {/* Tabela de Projeções por Animal */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <BarChart3 className="h-6 w-6 text-gray-600 mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">Projeções por Animal</h2>
                        </div>
                    </div>

                    {projections.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Brinco</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Peso Atual</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Peso Projetado</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Arrobas Carcaça</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Valor Estimado</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Custo Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Lucro Estimado</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {projections.map((projection, index) => (
                                        <tr key={projection.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{projection.brinco}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{projection.pesoAtual} kg</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    {projection.pesoProjetado} kg
                                                    <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{projection.arrobas}@</td>
                                            <td className="px-6 py-4 text-sm font-medium text-blue-600">{formatCurrency(projection.valorEstimado)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-red-600">{formatCurrency(projection.custoTotal)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-green-600">{formatCurrency(projection.lucroEstimado)}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    projection.roi > 100 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : projection.roi > 50 
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {projection.roi.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Nenhuma projeção disponível</p>
                            <p className="text-sm text-gray-400">Configure os parâmetros e clique em "Calcular Projeções"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Estimativa;