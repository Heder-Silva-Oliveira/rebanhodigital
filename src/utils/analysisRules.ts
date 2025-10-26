// src/utils/analysisRules.ts

export interface Metrics {
    taxaLotacao: number;
    gmdMedio: number;
    custoPorArroba: number;
    margemMedia: number;
    lucroMedio: number;
    receitaPorHectare: number;
    pontoEquilibrio: number;
    totalAnimais: number;
    scoreGeral: number;
}

export interface RegionalMedia {
    lotacao: number;
    gmd: number;
    custoArroba: number;
    margem: number;
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'Alta' | 'Média' | 'Baixa';
    impacto: string;
    esforco: string;
    roi: string;
}

// ----------------------------------------------------
// Função que Gera as Recomendações (Core da Lógica)
// ----------------------------------------------------
export const generateRecommendations = (
    metrics: Metrics, 
    mediaRegional: RegionalMedia
): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    // TRATAMENTO DE SEGURANÇA: Garante que os valores são finitos
    const taxaLotacao = isFinite(metrics.taxaLotacao) ? metrics.taxaLotacao : 0;
    const gmdMedio = isFinite(metrics.gmdMedio) ? metrics.gmdMedio : 0;
    const custoPorArroba = isFinite(metrics.custoPorArroba) ? metrics.custoPorArroba : 0;
    const margemMedia = isFinite(metrics.margemMedia) ? metrics.margemMedia : 0;

    // Métricas Regionais
    const { gmd: metaGmd, custoArroba: metaCusto, margem: metaMargem, lotacao: metaLotacao } = mediaRegional;

    // --- REGRA 1: NUTRIÇÃO / GMD ---
    if (gmdMedio > 0 && gmdMedio < metaGmd * 0.8) {
        recs.push({
            id: 'GMD001',
            title: 'Melhorar Programa Nutricional',
            description: `Seu GMD (${gmdMedio.toFixed(2)} kg/dia) está abaixo da meta de ${metaGmd} kg/dia. Implementar suplementação estratégica para aumentar o ganho de peso.`,
            category: 'Nutrição',
            priority: 'Alta',
            impacto: 'Aumento de 20-30% no GMD',
            esforco: 'Médio',
            roi: '25%'
        });
    }

    // --- REGRA 2: CUSTO POR ARROBA ALTO ---
    if (custoPorArroba > 0 && custoPorArroba > metaCusto * 1.1) {
        recs.push({
            id: 'CUST001',
            title: 'Revisar Custo de Produção',
            description: `O Custo/Arroba (R$ ${custoPorArroba.toFixed(0)}) está acima da meta regional. Identifique fontes de despesas excessivas para redução.`,
            category: 'Custos',
            priority: 'Alta',
            impacto: `Redução de R$ ${(custoPorArroba - metaCusto).toFixed(0)}/arroba`,
            esforco: 'Alto',
            roi: '30%'
        });
    }

    // --- REGRA 3: MARGEM DE LUCRO BAIXA ---
    if (margemMedia !== 0 && margemMedia < metaMargem - 5) {
        recs.push({
            id: 'MRGM001',
            title: 'Otimizar Margem de Venda',
            description: `Sua margem (${margemMedia.toFixed(1)}%) está abaixo da meta de ${metaMargem}%. Avalie oportunidades de venda ou rever estrutura de custos.`,
            category: 'Financeiro',
            priority: 'Média',
            impacto: `Aumentar Margem em pelo menos ${(metaMargem - margemMedia).toFixed(1)}%`,
            esforco: 'Baixo',
            roi: '15%'
        });
    }
    
    if (margemMedia == 0 ) {
        recs.push({
            id: 'MRGM001',
            title: 'Recizar lançamentos financeiros',
            description: `Sua margem (${margemMedia.toFixed(1)}%) estázerada. Pode ser que faltem lançamentos financeiros no sistema. Verifique e corrija.`,
            category: 'Financeiro',
            priority: 'Alta',
            impacto: `Realizar lançamentos financeiros corretos`,
            esforco: 'Alto',
            roi: '15%'
        });
    }
    // --- REGRA 4: LOTAÇÃO (SUBAUTILIZAÇÃO) ---
    if (taxaLotacao > 0 && taxaLotacao < metaLotacao * 0.5) {
        recs.push({
            id: 'LTC001',
            title: 'Aumentar Taxa de Lotação',
            description: `A Taxa de Lotação (${taxaLotacao.toFixed(2)} UA/ha) está subutilizada. Considere aumentar o rebanho para maximizar o uso da área.`,
            category: 'Produtividade',
            priority: 'Média',
            impacto: 'Aumento na Receita por Hectare',
            esforco: 'Médio',
            roi: '20%'
        });
    }

    // --- REGRA 5: LOTAÇÃO (SUPERLOTAÇÃO) ---
    if (taxaLotacao > metaLotacao * 1.3) {
        recs.push({
            id: 'LTC002',
            title: 'Ajustar Taxa de Lotação',
            description: `A Taxa de Lotação (${taxaLotacao.toFixed(2)} UA/ha) está acima do ideal. Pode estar comprometendo o bem-estar animal e a produtividade.`,
            category: 'Produtividade',
            priority: 'Média',
            impacto: 'Melhoria no bem-estar animal e GMD',
            esforco: 'Baixo',
            roi: '10%'
        });
    }

    // --- REGRA 6: RECEITA POR HECTARE BAIXA ---
    if (metrics.receitaPorHectare > 0 && metrics.receitaPorHectare < 2000) {
        recs.push({
            id: 'RPH001',
            title: 'Aumentar Receita por Hectare',
            description: `A Receita por Hectare (R$ ${metrics.receitaPorHectare.toFixed(0)}) está abaixo do potencial. Considere estratégias de intensificação.`,
            category: 'Produtividade',
            priority: 'Média',
            impacto: 'Aumento de 30-50% na receita por área',
            esforco: 'Alto',
            roi: '35%'
        });
    }

    return recs;
};