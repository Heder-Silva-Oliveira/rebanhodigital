import React, { useState, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, BarChart3, PieChart, Target, AlertTriangle, CheckCircle, Calendar, RefreshCw, Lightbulb, ChevronDown, Trophy, FileText, Download
} from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { generateRecommendations, Recommendation } from '../utils/analysisRules';

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

interface WeighingHistoryItem { date: string; weight: number; }
interface Animal { 
    id: string; 
    animalId: string;
    weight: number; 
    status: string; 
    purchasePrice?: number; 
    weighingHistory?: WeighingHistoryItem[]; 
    isBreedingFemale?: boolean; 
    birthDate?: string; 
}
interface FinancialTransaction { id: string; type: 'receita' | 'despesa'; status: 'pago' | 'pendente'; amount: number; date: string; }
interface Pasture { id: string; area: number; capacity: number; currentAnimals: number; status: string; }

// Assumimos um valor fixo para a Taxa de Desmama
const TAXA_DESMAMA_MOCK = 85.0;

const MEDIA_REGIONAL = {
    lotacao: 1.2,
    gmd: 0.50,
    custoArroba: 220,
    margem: 25
};

// Funções Auxiliares
const getKPIStatus = (value: number, target: number, higherIsBetter: boolean, lowWarning?: number) => {
    if (value === 0) return { color: 'gray', label: 'Sem Dados' };
    
    if (higherIsBetter) {
        if (value >= target) return { color: 'green', label: 'Meta Atingida' };
        if (lowWarning && value < lowWarning) return { color: 'red', label: 'Crítico' };
        return { color: 'yellow', label: 'Abaixo da Meta' };
    } else {
        if (value <= target) return { color: 'green', label: 'Meta Atingida' };
        return { color: 'red', label: 'Acima da Meta' };
    }
};

const getColorClass = (status: string) => {
    switch (status) {
        case 'green': return { bg: 'bg-green-50', border: 'border-green-500', dot: 'bg-green-500', text: 'text-green-600' };
        case 'yellow': return { bg: 'bg-yellow-50', border: 'border-yellow-500', dot: 'bg-yellow-500', text: 'text-yellow-600' };
        case 'red': return { bg: 'bg-red-50', border: 'border-red-500', dot: 'bg-red-500', text: 'text-red-600' };
        default: return { bg: 'bg-gray-100', border: 'border-gray-300', dot: 'bg-gray-500', text: 'text-gray-600' };
    }
};

const CompanyHealth: React.FC = () => {
    // Carregamento de Dados
    const { data: animals } = useCRUD<Animal>('animals');
    const { data: transactions } = useCRUD<FinancialTransaction>('financial_transactions');
    const { data: pastures } = useCRUD<Pasture>('pastures');
    const { data: weighings } = useCRUD<WeighingRecord>('weighing_records');
    const { data: healthRecords } = useCRUD('health_records');

    const [activeTab, setActiveTab] = useState('kpis');
    const [selectedMetric, setSelectedMetric] = useState('Lucratividade');
    const [selectedPeriod, setSelectedPeriod] = useState('12 meses');
    const [selectedCategory, setSelectedCategory] = useState('Todas as categorias');
    const [selectedPriority, setSelectedPriority] = useState('Todas as prioridades');
    const [selectedYear, setSelectedYear] = useState('2025');

    // Dados para tendências
    const trendsData = useMemo(() => {
        const monthlyAggregates: Record<string, { receitas: number, despesas: number }> = {};
        const dateKeys: { key: string, date: Date }[] = [];

        transactions.forEach((t: any) => {
            if (t.status === 'pago') {
                const date = new Date(t.date);
                const monthKey = `${date.getFullYear().toString().slice(-2)}/${date.toLocaleString('pt-BR', { month: 'short' })}`;
                
                if (!monthlyAggregates[monthKey]) {
                    monthlyAggregates[monthKey] = { receitas: 0, despesas: 0 };
                    dateKeys.push({ key: monthKey, date: date });
                }
                
                if (t.type === 'receita') {
                    monthlyAggregates[monthKey].receitas += t.amount;
                } else if (t.type === 'despesa') {
                    monthlyAggregates[monthKey].despesas += t.amount;
                }
            }
        });

        dateKeys.sort((a, b) => a.date.getTime() - b.date.getTime());

        return dateKeys.map(({ key }) => {
            const { receitas, despesas } = monthlyAggregates[key];
            const lucro = receitas - despesas;
            const margem = receitas > 0 ? (lucro / receitas) * 100 : (lucro < 0 ? -100 : 0);
            const monthLabel = key.split('/')[1];

            return {
                month: monthLabel,
                receitas: receitas / 1000,
                despesas: (despesas / 1000) * -1,
                lucro: lucro / 1000,
                margem: margem
            };
        });
    }, [transactions]);

    // Métricas principais
    const metrics = useMemo(() => {
        // Lógica Financeira
        const receitasPagos = transactions.filter(t => t.type === 'receita' && t.status === 'pago');
        const despesasPagos = transactions.filter(t => t.type === 'despesa' && t.status === 'pago');
        
        const totalReceitas = receitasPagos.reduce((sum, t) => sum + t.amount, 0);
        const totalDespesas = despesasPagos.reduce((sum, t) => sum + t.amount, 0);
        const lucroMedio = totalReceitas - totalDespesas;
        const margemMedia = totalReceitas > 0 ? ((lucroMedio / totalReceitas) * 100) : 0;
        
        // Lógica Zootécnica
        const totalArea = pastures.reduce((sum: any, p: any) => sum + p.area, 0);
        const totalPesoVivo = animals.reduce((sum: any, a: any) => sum + a.weight, 0);
        const totalUA = totalPesoVivo / 450;
        const taxaLotacao = totalArea > 0 ? (totalUA / totalArea) : 0;
        
        // Custo por Arroba
        const custoTotalAcumulado = totalDespesas;
        const pesoTotalArrobas = totalPesoVivo / 15;
        const custoPorArroba = pesoTotalArrobas > 0 ? (custoTotalAcumulado / pesoTotalArrobas) : 0;

        // Cálculo GMD
        const animalWeighingsMap: Record<string, WeighingRecord[]> = weighings.reduce((acc, record) => {
            if (!acc[record.animalId]) acc[record.animalId] = [];
            acc[record.animalId].push(record);
            return acc;
        }, {} as Record<string, WeighingRecord[]>);

        let totalGmd = 0;
        let animalCountWithGmd = 0;

        animals.forEach((animal: Animal) => {
            const rawHistory = animalWeighingsMap[animal.animalId];
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
        
        // Score Geral
        const scoreGeral = Math.min(100, Math.round(
            (margemMedia * 0.5) +
            (gmdMedio * 20) +
            (taxaLotacao * 10) -
            (custoPorArroba > MEDIA_REGIONAL.custoArroba ? 20 : 0)
        ));

        return {
            lucroMedio,
            margemMedia,
            scoreGeral,
            totalAnimais: animals.length,
            taxaLotacao,
            gmdMedio,
            custoPorArroba,
            receitaPorHectare: totalArea > 0 ? totalReceitas / totalArea : 0,
            pontoEquilibrio: totalReceitas > 0 ? totalDespesas / (totalReceitas / totalPesoVivo) : 0,
            totalReceitas,
            totalDespesas
        };
    }, [transactions, animals, pastures, weighings]);

    // Dados para o gráfico radar - CORRIGIDO
    const radarData = useMemo(() => {
        const calculateScore = (value: number, target: number, isHigherBetter: boolean) => {
            if (value === 0 && target === 0) return 50;
            if (isHigherBetter) {
                return Math.min(100, Math.round((value / target) * 100));
            } else {
                return Math.max(0, 100 - Math.round(((value - target) / target) * 100));
            }
        };

        const lotacaoScore = calculateScore(metrics.taxaLotacao, MEDIA_REGIONAL.lotacao, true);
        const gmdScore = calculateScore(metrics.gmdMedio, MEDIA_REGIONAL.gmd, true);
        const custoScore = calculateScore(metrics.custoPorArroba, MEDIA_REGIONAL.custoArroba, false);
        const margemScore = calculateScore(metrics.margemMedia, MEDIA_REGIONAL.margem, true);

        return [
            { indicator: 'Taxa de Lotação (UA/ha)', suaPropriedade: lotacaoScore, mediaRegional: 75 },
            { indicator: 'GMD (kg/dia)', suaPropriedade: gmdScore, mediaRegional: 70 },
            { indicator: 'Custo/Arroba (R$)', suaPropriedade: custoScore, mediaRegional: 60 },
            { indicator: 'Margem de Lucro (%)', suaPropriedade: margemScore, mediaRegional: 50 }
        ];
    }, [metrics]);

    // Recomendações - CORRIGIDO: useMemo separado
    const recommendations = useMemo(() => {
        return generateRecommendations(metrics, MEDIA_REGIONAL);
    }, [metrics]);

    // Métricas das recomendações
    const recommendationMetrics = useMemo(() => {
        const acoesCriticas = recommendations.filter(r => r.priority === 'Alta').length;
        const totalRecomendacoes = recommendations.length;
        
        const roiPotencialTotal = recommendations.reduce((total, rec) => {
            const roiValue = parseInt(rec.roi) || 0;
            return total + roiValue;
        }, 0) / Math.max(totalRecomendacoes, 1);
        
        return {
            acoesCriticas,
            totalRecomendacoes,
            roiPotencialTotal: Math.round(roiPotencialTotal)
        };
    }, [recommendations]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(value));
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => {
                        const isMonetary = entry.dataKey === 'receitas' || entry.dataKey === 'despesas' || entry.dataKey === 'lucro';
                        const isMargin = entry.dataKey === 'margem';
                        
                        const rawValue = isMonetary ? entry.value * 1000 : entry.value;
                        
                        let formattedValue: string;

                        if (isMargin) {
                            formattedValue = `${rawValue.toFixed(1)}%`;
                        } else {
                            formattedValue = new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(rawValue);
                        }

                        return (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-gray-600">{entry.name}:</span>
                                <span className="font-medium">{formattedValue}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const scoreStatus = getColorClass(metrics.scoreGeral >= 80 ? 'green' : metrics.scoreGeral >= 50 ? 'yellow' : 'red');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saúde da Empresa</h1>
              <p className="text-gray-600">Análise estratégica completa do seu negócio pecuário</p>
            </div>
          </div>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 mt-4 sm:mt-0">
            <RefreshCw size={18} />
            <span>Atualizar Dados</span>
          </button>
        </div>

        {/* Score Geral */}
                <div className={`${scoreStatus.bg} border ${getColorClass(scoreStatus.color).border} rounded-lg p-6 mb-8`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 ${getColorClass(scoreStatus.color).bg} rounded-full`}>
                                <AlertTriangle className={`${scoreStatus.text}`} size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Saúde Geral do Negócio</h3>
                                <p className="text-sm text-gray-600">Índice baseado nos principais indicadores</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-bold ${scoreStatus.text} mb-1`}>{metrics.scoreGeral}</div>
                            <div className="text-sm text-gray-600">de 100 pontos</div>
                            <div className="text-sm text-red-600 font-medium">Piorando</div> 
                            {/* A lógica 'Piorando' deve vir de uma comparação histórica, mas é mockada aqui */}
                        </div>
                    </div>
                </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'kpis', name: 'Painel de KPIs', icon: BarChart3, desc: 'Indicadores críticos e score de saúde' },
                { id: 'trends', name: 'Análise de Tendências', icon: TrendingUp, desc: 'Evolução histórica e insights' },
                { id: 'comparison', name: 'Comparação Regional', icon: Target, desc: 'Benchmarking e posicionamento' },
                { id: 'recommendations', name: 'Recomendações', icon: CheckCircle, desc: 'Sugestões inteligentes e ações' },
                { id: 'report', name: 'Relatório Anual', icon: PieChart, desc: 'Relatório completo e plano estratégico' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs text-gray-400 font-normal">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Painel de KPIs */}
                {activeTab === 'kpis' && (
                    <div className="space-y-8">
                        {/* Grid de KPIs - Primeira linha */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 1. Taxa de Lotação */}
                            {(() => {
                                const status = getKPIStatus(metrics.taxaLotacao, 1.0, true, 0.5); 
                                const colors = getColorClass(status.color);
                                
                                return (
                                    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Taxa de Lotação</h3>
                                            <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.taxaLotacao.toFixed(2)}<span className="text-sm font-normal"> UA/ha</span></div>
                                            <div className="text-sm text-gray-600">Meta: 1.0-1.5</div>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* 2. Ganho Médio Diário */}
                            {(() => {
                                const status = getKPIStatus(metrics.gmdMedio, 0.8, true, 0.5); 
                                const colors = getColorClass(status.color);
                                
                                return (
                                    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Ganho Médio Diário</h3>
                                            <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.gmdMedio.toFixed(3)} <span className="text-sm font-normal">kg/dia</span></div>
                                            <div className="text-sm text-gray-600">Meta: &gt; 0.8</div>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* 3. Taxa de Desmama (Ainda com valor mockado) */}
                            {(() => {
                                const taxaDesmama = TAXA_DESMAMA_MOCK; 
                                const status = getKPIStatus(taxaDesmama, 85.0, true); 
                                const colors = getColorClass(status.color);
                                
                                return (
                                    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Taxa de Desmama</h3>
                                            <div className="text-3xl font-bold text-gray-900 mb-2">{taxaDesmama.toFixed(1)} <span className="text-sm font-normal">%</span></div>
                                            <div className="text-sm text-gray-600">Meta: &gt; 85%</div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Grid de KPIs - Segunda linha */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 4. Custo por Arroba */}
                            {(() => {
                                const status = getKPIStatus(metrics.custoPorArroba, MEDIA_REGIONAL.custoArroba, false); 
                                const colors = getColorClass(status.color);
                                
                                return (
                                    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Custo por Arroba</h3>
                                            <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.custoPorArroba.toFixed(0)} <span className="text-sm font-normal">R$</span></div>
                                            <div className="text-sm text-gray-600">Meta: &lt; {MEDIA_REGIONAL.custoArroba}</div>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* 5. Margem de Lucro */}
                            {(() => {
                                const status = getKPIStatus(metrics.margemMedia, MEDIA_REGIONAL.margem, true); 
                                const colors = getColorClass(status.color);
                                
                                return (
                                    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Margem de Lucro</h3>
                                            <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.margemMedia.toFixed(1)} <span className="text-sm font-normal">%</span></div>
                                            <div className="text-sm text-gray-600">Meta: &gt; {MEDIA_REGIONAL.margem}%</div>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* 6. Receita por Hectare */}
                            {(() => {
                                const status = getKPIStatus(metrics.receitaPorHectare, 3000, true); 
                                const colors = getColorClass(status.color);
                                
                                return (
                                    <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Receita por Hectare</h3>
                                            <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(metrics.receitaPorHectare)} <span className="text-sm font-normal">/ha/ano</span></div>
                                            <div className="text-sm text-gray-600">Meta: &gt; R$ 3.000</div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                        
                        {/* Ponto de Equilíbrio */}
                        {(() => {
                            // Cálculo do Ponto de Equilíbrio (P.E. = Custos Totais / Preço de Venda por Arroba)
                            // Assumimos Preço de Venda da Arroba como R$ 220,00
                            const precoVendaArroba = 220; 
                            const peArrobas = metrics.custoPorArroba > 0 ? (metrics.lucroMedio / precoVendaArroba).toFixed(0) : '0'; // Corrigido para usar lucroMedio para PE

                            return (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Ponto de Equilíbrio</h3>
                                            <p className="text-sm text-gray-600">Arrobas necessárias para cobrir custos</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-bold text-blue-600 mb-1">{peArrobas}</div>
                                            <div className="text-sm text-gray-600">arrobas</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}
                        
                    </div>
                )}
        {/* Análise de Tendências */}
        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* Header da seção */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise de Tendências</h2>
                <p className="text-gray-600">Evolução histórica dos principais indicadores</p>
              </div>
              <div className="flex space-x-4">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Lucratividade">Lucratividade</option>
                  <option value="Margem">Margem</option>
                  <option value="Receitas">Receitas</option>
                  <option value="Despesas">Despesas</option>
                </select>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="12 meses">12 meses</option>
                  <option value="6 meses">6 meses</option>
                  <option value="3 meses">3 meses</option>
                </select>
              </div>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lucro Médio */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="text-blue-600" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600 font-medium">R$ {metrics.lucroMedio}</div>
                    <div className="text-xs text-gray-500">vs período anterior</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Lucro Médio</h3>
                  <div className="text-2xl font-bold text-gray-900">R$ {metrics.lucroMedio}</div>
                </div>
              </div>

              {/* Margem Média */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="text-green-600" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-medium">+0.0%</div>
                    <div className="text-xs text-gray-500">vs período anterior</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Margem Média</h3>
                  <div className="text-2xl font-bold text-gray-900">{metrics.margemMedia}%</div>
                </div>
              </div>

              {/* Score de Saúde */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="text-purple-600" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600 font-medium">Piorando</div>
                    <div className="text-xs text-gray-500">tendência atual</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Score de Saúde</h3>
                  <div className="text-2xl font-bold text-gray-900">{metrics.scoreGeral}/100</div>
                </div>
              </div>
            </div>

            {/* Gráfico de Análise de Lucratividade */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Análise de Lucratividade</h3>
                  <p className="text-sm text-gray-600">Receitas, despesas, lucro e margem de lucro ao longo do tempo</p>
                </div>
                <Calendar className="text-gray-400" size={20} />
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Barras de Receitas (Positivas) */}
                    <Bar 
                      yAxisId="left"
                      dataKey="receitas" 
                      fill="#ef4444" 
                      name="Receitas"
                      radius={[2, 2, 0, 0]}
                    />
                    
                    {/* Barras de Despesas (Negativas) */}
                    <Bar 
                      yAxisId="left"
                      dataKey="despesas" 
                      fill="#3b82f6" 
                      name="Despesas"
                      radius={[0, 0, 2, 2]}
                    />
                    
                    {/* Linha de Margem */}
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="margem" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      name="Margem (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Comparação Regional */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            {/* Card "Acima da Média Regional" */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Acima da Média Regional</h3>
                    <p className="text-sm text-gray-600">Parabéns! Seu negócio está performando melhor que a maioria dos produtores da região.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600 mb-1">90°</div>
                  <div className="text-sm text-gray-600">percentil</div>
                </div>
              </div>
            </div>

            {/* Comparação Visual de Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Comparação Visual de Performance</h3>
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="indicator" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <PolarRadiusAxis 
                      angle={0} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                    />
                    <Radar
                      name="Sua Propriedade"
                      dataKey="suaPropriedade"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Média Regional"
                      dataKey="mediaRegional"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="line"
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparação Detalhada por Indicador */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Comparação Detalhada por Indicador</h3>
              </div>

              <div className="space-y-8">
                {/* Taxa de Lotação */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Taxa de Lotação</h4>
                    <span className="text-sm font-medium text-red-600">93.3% menor</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Sua Propriedade</span>
                      <span className="font-medium">{metrics.taxaLotacao.toFixed(2)} UA/ha</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Média Regional</span>
                      <span className="font-medium">1.20 UA/ha</span>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                      <div className="bg-teal-600 h-3 rounded-full absolute top-0 left-0" style={{ width: '7%' }}></div>
                    </div>
                  </div>
                </div>

                {/* GMD */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">GMD</h4>
                    <span className="text-sm font-medium text-red-600">16.7% menor</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Sua Propriedade</span>
                      <span className="font-medium">{metrics.gmdMedio.toFixed(3)} kg/dia</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Média Regional</span>
                      <span className="font-medium">{ MEDIA_REGIONAL.gmd} kg/dia</span>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                      <div className="bg-teal-600 h-3 rounded-full absolute top-0 left-0" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Custo/Arroba */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Custo/Arroba</h4>
                    <span className="text-sm font-medium text-green-600">97.2% menor</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Sua Propriedade</span>
                      <span className="font-medium">R$ 6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Média Regional</span>
                      <span className="font-medium">R$ { MEDIA_REGIONAL.custoArroba}</span>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                      <div className="bg-teal-600 h-3 rounded-full absolute top-0 left-0" style={{ width: '3%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Margem de Lucro */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Margem de Lucro</h4>
                    <span className="text-sm font-medium text-green-600">257.8% maior</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Sua Propriedade</span>
                      <span className="font-medium">{metrics.margemMedia}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Média Regional</span>
                      <span className="font-medium">{ MEDIA_REGIONAL.margem}%</span>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '28%' }}></div>
                      <div className="bg-blue-500 h-3 rounded-full absolute top-0 left-0" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Oportunidades de Melhoria */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Oportunidades de Melhoria</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Melhorar Taxa de Lotação</h4>
                    <p className="text-sm text-gray-600">Aumentar para 1.20 UA/ha para atingir a média regional</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Melhorar GMD</h4>
                    <p className="text-sm text-gray-600">Aumentar para 0.75 kg/dia para atingir a média regional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

         {/* Aba de Recomendações - CORRIGIDA */}
                {activeTab === 'recommendations' && (
                    <div className="space-y-8">
                        {/* Header da seção */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Lightbulb className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Recomendações Inteligentes</h2>
                                    <p className="text-gray-600">Sugestões personalizadas baseadas na análise dos seus dados</p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="Todas as categorias">Todas as categorias</option>
                                    <option value="Nutrição">Nutrição</option>
                                    <option value="Custos">Custos</option>
                                    <option value="Produtividade">Produtividade</option>
                                    <option value="Financeiro">Financeiro</option>
                                </select>
                                <select
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value)}
                                    className="p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="Todas as prioridades">Todas as prioridades</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Média">Média</option>
                                    <option value="Baixa">Baixa</option>
                                </select>
                            </div>
                        </div>

                        {/* Cards de Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* ROI Potencial Total */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-green-600 font-medium text-sm">ROI Potencial Total</div>
                                    <TrendingUp className="text-green-600" size={20} />
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">{recommendationMetrics.roiPotencialTotal}%</div>
                            </div>

                            {/* Ações Críticas */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-red-600 font-medium text-sm">Ações Críticas</div>
                                    <div className="flex items-center space-x-1">
                                        <AlertTriangle className="text-red-600" size={16} />
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">{recommendationMetrics.acoesCriticas}</div>
                            </div>

                            {/* Total de Recomendações */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-blue-600 font-medium text-sm">Total de Recomendações</div>
                                    <Lightbulb className="text-blue-600" size={20} />
                                </div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">{recommendationMetrics.totalRecomendacoes}</div>
                            </div>
                        </div>

                        {/* Lista de Recomendações */}
                        <div className="space-y-6">
                            {recommendations.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Excelente Trabalho!</h3>
                                    <p className="text-gray-600">Todos os indicadores estão dentro das metas estabelecidas.</p>
                                </div>
                            ) : (
                                recommendations
                                    .filter(rec => 
                                        (selectedCategory === 'Todas as categorias' || rec.category === selectedCategory) &&
                                        (selectedPriority === 'Todas as prioridades' || rec.priority === selectedPriority)
                                    )
                                    .map((recommendation) => (
                                        <div 
                                            key={recommendation.id}
                                            className={`bg-white border-l-4 ${
                                                recommendation.priority === 'Alta' ? 'border-red-500' :
                                                recommendation.priority === 'Média' ? 'border-yellow-500' :
                                                'border-green-500'
                                            } rounded-lg shadow-sm overflow-hidden`}
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 ${
                                                            recommendation.category === 'Nutrição' ? 'bg-green-100' :
                                                            recommendation.category === 'Custos' ? 'bg-red-100' :
                                                            recommendation.category === 'Produtividade' ? 'bg-blue-100' :
                                                            'bg-purple-100'
                                                        } rounded-lg`}>
                                                            <div className={`w-6 h-6 ${
                                                                recommendation.category === 'Nutrição' ? 'bg-green-600' :
                                                                recommendation.category === 'Custos' ? 'bg-red-600' :
                                                                recommendation.category === 'Produtividade' ? 'bg-blue-600' :
                                                                'bg-purple-600'
                                                            } rounded flex items-center justify-center`}>
                                                                <span className="text-white text-xs font-bold">
                                                                    {recommendation.category === 'Nutrição' ? '🌱' :
                                                                     recommendation.category === 'Custos' ? '💰' :
                                                                     recommendation.category === 'Produtividade' ? '📊' : '📈'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-sm text-gray-600">{recommendation.category}</span>
                                                                <span className={`px-2 py-1 ${
                                                                    recommendation.priority === 'Alta' ? 'bg-red-100 text-red-600' :
                                                                    recommendation.priority === 'Média' ? 'bg-yellow-100 text-yellow-600' :
                                                                    'bg-green-100 text-green-600'
                                                                } text-xs font-medium rounded-full`}>
                                                                    {recommendation.priority}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-gray-700 mb-6">
                                                    {recommendation.description}
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-blue-600 mb-1">IMPACTO ESPERADO</div>
                                                        <div className="text-lg font-semibold text-gray-900">{recommendation.impacto}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-orange-600 mb-1">ESFORÇO NECESSÁRIO</div>
                                                        <div className="text-lg font-semibold text-gray-900">{recommendation.esforco}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-green-600 mb-1">ROI ESTIMADO</div>
                                                        <div className="text-lg font-semibold text-gray-900">{recommendation.roi}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

        {/* Relatório Anual */}
        {activeTab === 'report' && (
          <div className="space-y-8">
            {/* Header da seção com seletor de ano e botão de exportar */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Relatório Anual de Saúde da Empresa</h2>
                    <p className="text-gray-600">Análise completa do desempenho e planejamento estratégico</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <Download size={18} />
                    <span>Exportar PDF</span>
                  </button>
                </div>
              </div>

              {/* Cabeçalho do Relatório */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Relatório Anual de Saúde da Empresa</h1>
                <p className="text-blue-100 text-lg mb-4">Análise Estratégica 2025</p>
                <div className="flex items-center justify-center space-x-2 text-blue-100">
                  <Calendar size={18} />
                  <span>Gerado em 07/10/2025</span>
                </div>
              </div>
            </div>

            {/* Resumo Executivo */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo Executivo</h2>
              
              {/* Cards de métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Score de Saúde */}
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-600 mb-2">Score de Saúde</div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{metrics.scoreGeral}</div>
                  <div className="text-sm text-gray-600">de 100 pontos</div>
                </div>

                {/* Lucro Anual */}
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600 mb-2">Lucro Anual</div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">R$ -145</div>
                  <div className="text-sm text-blue-600 flex items-center justify-center">
                    <TrendingDown size={14} className="mr-1" />
                    0.0%
                  </div>
                </div>

                {/* Margem de Lucro */}
                <div className="text-center">
                  <div className="text-sm font-medium text-yellow-600 mb-2">Margem de Lucro</div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">64.4%</div>
                  <div className="text-sm text-gray-600">média anual</div>
                </div>

                {/* GMD Médio */}
                <div className="text-center">
                  <div className="text-sm font-medium text-purple-600 mb-2">GMD Médio</div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">0.63 kg</div>
                  <div className="text-sm text-gray-600">por dia</div>
                </div>
              </div>

              {/* Descrição do desempenho */}
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  O ano de 2025 apresentou um desempenho satisfatório com score de saúde de 70 pontos. O lucro apresentou declínio de 0.0% em relação ao ano anterior, 
                  demonstrando desafios que precisam ser endereçados na operação.
                </p>
              </div>
            </div>

            {/* Análise de Tendências */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Análise de Tendências</h2>
              
              {/* Placeholder para gráfico de tendências */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 size={48} className="mx-auto mb-2" />
                  <p>Gráfico de Tendências Anuais</p>
                </div>
              </div>
            </div>

            {/* Comparativo com Ano Anterior */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Comparativo com Ano Anterior</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">INDICADOR</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">2024</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">2025</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">VARIAÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-900">Receita Total</td>
                      <td className="py-4 px-4 text-center text-gray-700">R$ 0</td>
                      <td className="py-4 px-4 text-center text-gray-700">R$ 0</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">+0.0%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-900">Despesas Totais</td>
                      <td className="py-4 px-4 text-center text-gray-700">R$ 0</td>
                      <td className="py-4 px-4 text-center text-gray-700">R$ 145</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">+0.0%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-900">Lucro Total</td>
                      <td className="py-4 px-4 text-center text-gray-700">R$ 0</td>
                      <td className="py-4 px-4 text-center text-gray-700">R$ -145</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">+0.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnóstico de Pontos de Atenção */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Diagnóstico de Pontos de Atenção</h2>
              
              {/* Placeholder para diagnóstico */}
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <AlertTriangle size={48} className="mx-auto mb-2" />
                  <p>Análise de Pontos Críticos</p>
                </div>
              </div>
            </div>

            {/* Plano de Ação Estratégico 2026 */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Plano de Ação Estratégico 2026</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">Q1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Produtivo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Ação</div>
                          <div className="text-gray-600">Melhorar programa nutricional</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Meta</div>
                          <div className="text-gray-600">Atingir GMD de 1.0 kg/dia</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conclusões e Recomendações */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Conclusões e Recomendações</h2>
              
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Com base na análise dos dados de 2025, recomendamos focar nos seguintes pontos para 2026:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Investir em melhorias no programa nutricional para aumentar o ganho de peso</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Manter monitoramento contínuo dos KPIs através do sistema de gestão</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Implementar as recomendações do sistema de análise inteligente</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Revisar e atualizar metas trimestralmente</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  O acompanhamento sistemático destes indicadores será fundamental para o sucesso da operação em 2026.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyHealth
