import React, { useMemo } from 'react'
import {
    TrendingUp, TrendingDown, AlertTriangle, Calendar, DollarSign,
    Calculator, BarChart3, Shield, Target, MapPin, Loader2
} from 'lucide-react'
import { useCRUD } from '../hooks/useCRUD'
import { format } from 'date-fns'
// Importações de interfaces (Assumindo que estão disponíveis globalmente ou importadas)
// Exemplo:
// import { Animal } from './Animals'
// import { FinancialTransaction } from './Financial'
// import { PlanningItem } from './Planning'
// import { Pasture } from './Pastures'

// ----------------------------------------------------------------------
// DEFINIÇÕES DE INTERFACE MÍNIMAS (para o compilador)
// ----------------------------------------------------------------------
interface Animal { id: string; weight: number; status: string; purchasePrice?: number; }
interface FinancialTransaction { id: string; type: 'receita' | 'despesa'; status: 'pago' | 'pendente'; amount: number; }
interface PlanningItem { id: string; type: string; endDate: string; status: string; }
interface Pasture { id: string; area: number; capacity: number; currentAnimals: number; status: string; }
// Definir interfaces
interface WeighingRecord {
    id: string;
    animalId: string;
    weight: number;
    date: string;
    notes: string;
    measuredBy: string;
    location: string;
    purpose: string;
    created_at: string;
}
// ----------------------------------------------------------------------


const Dashboard: React.FC = () => {
    // 1. CHAMA MÚLTIPLOS HOOKS PARA TODAS AS ENTIDADES
    const { data: animals, loading: loadingAnimals } = useCRUD<Animal>('animals');
    const { data: transactions, loading: loadingFinance } = useCRUD<FinancialTransaction>('financial_transactions');
    const { data: plans, loading: loadingPlans } = useCRUD<PlanningItem>('planning');
    const { data: pastures, loading: loadingPastures } = useCRUD<Pasture>('pastures');
    const { data: weighings } = useCRUD<WeighingRecord>('weighing_records');

    const isLoading = loadingAnimals || loadingFinance || loadingPlans || loadingPastures;

    // 2. CÁLCULO DE TODOS OS INDICADORES (MEMOIZADO)
    // CompanyHealth.tsx
    // =======================================================
    // REESCRITA TOTAL DO useMemo 'metrics'
    // =======================================================
    const metrics = useMemo(() => {
        // Cálculos financeiros
        const totalReceitas = transactions
            .filter(t => t.type === 'receita' && t.status === 'pago')
            .reduce((sum: number, t: FinancialTransaction) => sum + (t.amount || 0), 0);
        
        const totalDespesas = transactions
            .filter(t => t.type === 'despesa' && t.status === 'pago')
            .reduce((sum: number, t: FinancialTransaction) => sum + (t.amount || 0), 0);
        
        const lucroLiquido = totalReceitas - totalDespesas;
        const margemMedia = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100) : 0;

        // Cálculos zootécnicos
        const totalArea = pastures.reduce((sum: number, p: Pasture) => sum + (p.area || 0), 0);
        const ativos = animals.filter(a => a.status === 'ativo');
        const totalPesoVivo = ativos.reduce((sum: number, a: Animal) => sum + (a.weight || 0), 0);
        const totalUA = totalPesoVivo / 450;
        const taxaLotacao = totalArea > 0 ? (totalUA / totalArea) : 0;

        // Cálculo GMD - CORRIGIDO
        const animalWeighingsMap: Record<string, WeighingRecord[]> = weighings.reduce((acc, record) => {
            if (!acc[record.animalId]) acc[record.animalId] = [];
            acc[record.animalId].push(record);
            return acc;
        }, {} as Record<string, WeighingRecord[]>);

        let totalGmd = 0;
        let animalCountWithGmd = 0;

        animals.forEach((animal: Animal) => {
            const rawHistory = animalWeighingsMap[animal.animalId]; // animalId existe agora
            const history = rawHistory 
            ? [...rawHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            : null;

            if (history && history.length >= 2) {
            const firstEntry = history[0];
            const lastEntry = history[history.length - 1];
            
            const diffWeight = lastEntry.weight - firstEntry.weight;
            const diffDays = (new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 3600 * 24);

            if (diffDays > 0) {
                totalGmd += diffWeight / diffDays;
                animalCountWithGmd++;
            }
            }
        });

        const gmdMedio = animalCountWithGmd > 0 ? totalGmd / animalCountWithGmd : 0;

        // --- CÁLCULO MORTALIDADE ---
        const totalAnimaisCadastrados = animals.length;
        const animaisMortos = animals.filter(a => a.status === 'morto').length;
        const taxaMortalidade = totalAnimaisCadastrados > 0 ? (animaisMortos / totalAnimaisCadastrados) * 100 : 0;
        
        // --- CÁLCULO RENDIMENTO CARCAÇA (Estimado) ---
        // Valor estimado (mockado) por falta de dados reais de abate no JSON
        const rendimentoCarcaca = 50.0; 

        // --- CÁLCULO CUSTO POR ARROBA ---
        const custoTotalAcumulado = totalDespesas; 
        const pesoTotalArrobas = totalPesoVivo / 15;
        const custoPorArroba = pesoTotalArrobas > 0 ? (custoTotalAcumulado / pesoTotalArrobas) : 0;
        
        // ----------------------------------------------------
        // 3. CÁLCULOS DE ALERTA E PLANEJAMENTO
        // ----------------------------------------------------
        const prontosParaVenda = animals.filter(a => a.weight >= 450 && a.status === 'ativo').length;
        
        const overduePlans = plans.filter(p =>
            p.status !== 'concluido' && new Date(p.endDate) < new Date()
        ).length;

        const proximaVacina = plans.filter(p => p.type === 'vacinacao')
            .filter(p => new Date(p.endDate) > new Date())
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];

        // ----------------------------------------------------
        // 4. SCORE GERAL (USANDO VARIÁVEIS CALCULADAS)
        // ----------------------------------------------------
        const MEDIA_REGIONAL = {
            lotacao: 1.2,       // Meta de 1.2 UA/ha
            gmd: 0.75,          // Meta de 0.75 kg/dia
            custoArroba: 220,   // Meta de R$ 220
            margem: 25          // Meta de 25%
        };
        const gmdMeta = MEDIA_REGIONAL.gmd || 0.75; // Use 0.75 como fallback
        const custoMeta = MEDIA_REGIONAL.custoArroba || 220; // Use 220 como fallback

        const scoreGeral = Math.min(100, Math.max(0, Math.round(
            (margemMedia * 0.5) +          // Peso da Margem (0.5 ponto por %)
            (gmdMedio * 10) +              // Peso do GMD (10 pontos por kg/dia)
            (taxaLotacao * 10) -           // Peso da Lotação (10 pontos por UA/ha)
            (custoPorArroba > custoMeta ? 20 : 0)  // Penaliza se o custo for alto
        )));


        return {
            lucroLiquido: lucroLiquido,
            custoPorArroba: custoPorArroba,
            gmdMedio: gmdMedio,
            margemMedia: margemMedia,
            taxaMortalidade: taxaMortalidade,
            rendimentoCarcaca: rendimentoCarcaca,
            taxaLotacao: taxaLotacao,
            scoreGeral: scoreGeral, // NOVO VALOR DINÂMICO
            
            // Dados de Alerta/Planejamento:
            prontosParaVenda: prontosParaVenda,
            overduePlans: overduePlans,
            proximaVacina: proximaVacina,
            totalArea: totalArea
        };
    }, [animals, transactions, pastures, plans, weighings]); // TODAS as dependências no useMemo



    // 3. ESTRUTURA DOS INDICADORES DINÂMICOS

    const indicadoresCriticos = [
        {
            titulo: 'Lucro Líquido',
            valor: metrics.lucroLiquido,
            formato: 'currency',
            descricao: 'Saldo (Receitas - Despesas)',
            icone: <DollarSign className="text-white" size={24} />,
            cor: metrics.lucroLiquido >= 0 ? 'bg-green-500' : 'bg-red-500',
            tipo: metrics.lucroLiquido >= 0 ? 'positivo' : 'negativo',
            variacao: 'N/A' // Simples, pois não temos histórico
        },
        {
            titulo: 'Custo por Arroba',
            valor: metrics.custoPorArroba,
            formato: 'currency',
            descricao: `Total Despesas / Arrobas em Estoque`,
            icone: <Calculator className="text-white" size={24} />,
            cor: metrics.custoPorArroba < 200 ? 'bg-green-500' : 'bg-orange-500', // Meta de exemplo
            tipo: metrics.custoPorArroba < 200 ? 'positivo' : 'negativo',
            variacao: 'R$ 200 (Meta)'
        },
        {
            titulo: 'GMD do Rebanho',
            valor: metrics.gmdMedio,
            unidade: 'kg/dia',
            formato: 'number',
            descricao: `Taxa de Crescimento Média`,
            icone: <TrendingUp className="text-white" size={24} />,
            cor: metrics.gmdMedio >= 0.85 ? 'bg-blue-500' : 'bg-red-500', 
            tipo: metrics.gmdMedio >= 0.85 ? 'positivo' : 'negativo',
            variacao: metrics.gmdMedio.toFixed(2),
        },
        {
            titulo: 'Área de Pastagem',
            valor: metrics.totalArea,
            unidade: 'ha',
            formato: 'number',
            descricao: `Área total cadastrada`,
            icone: <MapPin className="text-white" size={24} />,
            cor: 'bg-purple-500',
            tipo: 'positivo',
            variacao: 'N/A',
        }
    ];

    const alertas = [
        {
            id: 1,
            tipo: 'Animais Prontos para Venda',
            descricao: `${metrics.prontosParaVenda} animais atingiram peso ideal (450kgs)`,
            cor: metrics.prontosParaVenda > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-green-500 bg-green-50',
            icone: <Target className="text-red-500" size={20} />
        },
        {
            id: 2,
            tipo: 'Taxa de Lotação',
            descricao: `Lotação atual: ${metrics.taxaLotacao.toFixed(2)} UA/ha`,
            cor: metrics.taxaLotacao > 1.5 ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50',
            icone: <MapPin className="text-yellow-500" size={20} />
        },
        {
            id: 3,
            tipo: 'Próxima Vacinação',
            descricao: metrics.proximaVacina
                ? `Vencimento em ${format(new Date(metrics.proximaVacina.endDate), 'dd/MM')}`
                : 'Nenhuma vacinação planejada',
            cor: metrics.proximaVacina ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-500 bg-gray-50',
            icone: <Shield className="text-blue-500" size={20} />
        },
        {
            id: 4,
            tipo: 'Atividades Atrasadas',
            descricao: `${metrics.overduePlans} planos com prazo final expirado.`,
            cor: metrics.overduePlans > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-green-500 bg-green-50',
            icone: <AlertTriangle className="text-red-500" size={20} />
        }
    ];

    const formatValue = (value: number, formatType: string) => {
        if (formatType === 'currency') {
            return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (formatType === 'percent') {
            return `${value.toFixed(1)}%`;
        }
        return value.toLocaleString('pt-BR');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b mb-8">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <Target className="text-red-600" size={18} />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard Pecuária de Corte</h1>
                            </div>
                            <p className="text-gray-600">Gestão completa do negócio pecuário - Indicadores zootécnicos e financeiros</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar size={16} />
                                <span>Última atualização:</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{format(new Date(), 'dd/MM/yyyy')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-8">
                {/* Alertas e Ações Prioritárias */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-500" size={20} />
                        <h2 className="text-xl font-semibold text-gray-900">Alertas e Ações Prioritárias</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {alertas.map((alerta) => (
                            <div key={alerta.id} className={`bg-white rounded-lg border-l-4 ${alerta.cor} p-4 shadow-sm`}>
                                <div className="flex items-start justify-between mb-2">
                                    {alerta.icone}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{alerta.tipo}</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">{alerta.descricao}</p>
                                {/* Removendo o alerta.receita hardcoded */}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indicadores Críticos */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-yellow-500" size={20} />
                        <h2 className="text-xl font-semibold text-gray-900">Indicadores Críticos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {indicadoresCriticos.map((indicador, index) => (
                            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                                <div className={`w-12 h-12 ${indicador.cor} rounded-lg flex items-center justify-center mb-4`}>
                                    {indicador.icone}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-600">{indicador.titulo}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {formatValue(indicador.valor, indicador.formato)}
                                        </span>
                                        {indicador.unidade && (
                                            <span className="text-sm text-gray-500">{indicador.unidade}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{indicador.descricao}</span>
                                        {indicador.variacao && indicador.variacao !== 'N/A' && (
                                            <div className={`flex items-center gap-1 text-xs font-medium ${
                                                indicador.tipo === 'positivo' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {indicador.tipo === 'positivo' ? (
                                                    <TrendingUp size={12} />
                                                ) : (
                                                    <TrendingDown size={12} />
                                                )}
                                                {indicador.variacao}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indicadores de Performance */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-blue-500" size={20} />
                        <h2 className="text-xl font-semibold text-gray-900">Indicadores de Performance</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Indicadores fixos, mas usando dados reais para mortalidade e rendimento */}
                        {
                            [
                                {
                                    titulo: 'Rendimento de Carcaça',
                                    valor: metrics.rendimentoCarcaca,
                                    meta: 'Meta: 56%',
                                    status: metrics.rendimentoCarcaca >= 56 ? 'success' : 'warning',
                                    formato: 'percent'
                                },
                                {
                                    titulo: 'Mortalidade',
                                    valor: metrics.taxaMortalidade,
                                    meta: 'Meta: <1%',
                                    status: metrics.taxaMortalidade < 1 ? 'success' : 'error',
                                    formato: 'percent'
                                },
                                {
                                    titulo: 'Taxa de Utilização',
                                    valor: (metrics.taxaLotacao / 1.5) * 100, // Exemplo de cálculo de taxa
                                    meta: 'Meta: 80%',
                                    status: metrics.taxaLotacao > 1.8 ? 'error' : 'success',
                                    formato: 'percent'
                                },
                                {
                                    titulo: 'Atividades Pendentes',
                                    valor: metrics.overduePlans,
                                    meta: 'Meta: 0',
                                    status: metrics.overduePlans === 0 ? 'success' : 'error',
                                    formato: 'number'
                                }
                            ].map((indicador, index) => (
                                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                                        indicador.status === 'success' ? 'bg-green-100' : 
                                        indicador.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                                    }`}>
                                        <div className={`w-6 h-6 rounded-full ${
                                            indicador.status === 'success' ? 'bg-green-500' : 
                                            indicador.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-600">{indicador.titulo}</h3>
                                        <div className="text-2xl font-bold text-gray-900">{formatValue(indicador.valor, indicador.formato)}</div>
                                        <div className="text-xs text-gray-500">{indicador.meta}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;