import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, MapPin, Activity, 
  AlertCircle, Calculator, Layers, Scale 
} from 'lucide-react';

const Estimativa: React.FC = () => {
  // --- Estados de Input ---
  const [qtdAnimais, setQtdAnimais] = useState(1);
  const [compraValor, setCompraValor] = useState(1850);
  const [pesoInicial, setPesoInicial] = useState(180);
  const [gmd, setGmd] = useState(0.650);
  const [diasCiclo, setDiasCiclo] = useState(300);
  const [suplementoDia, setSuplementoDia] = useState(1.80);
  const [arrendamentoMes, setArrendamentoMes] = useState(35);
  const [maoDeObraMes, setMaoDeObraMes] = useState(0);
  const [sanidadeMes, setSanidadeMes] = useState(15); // Alterado para mensal
  const [vendaValor, setVendaValor] = useState(270);
  const [unidadeVenda, setUnidadeVenda] = useState<'arroba' | 'kg'>('arroba'); // Toggle @ ou kg
  const [rendimento, setRendimento] = useState(50);
  const [mortalidade, setMortalidade] = useState(0);

  // --- Estados de Resultado ---
  const [resultados, setResultados] = useState({
    pesoFinalVivo: 0,
    pesoFinalCarcaca: 0,
    pesoFinalArroba: 0,
    custoNutricao: 0,
    custoTerra: 0,
    custoSanidade: 0,
    custoMaoDeObra: 0,
    custoTotalCabeca: 0,
    custoTotalLote: 0,
    receitaLiquidaLote: 0,
    lucroLiquidoCabeca: 0,
    lucroLiquidoLote: 0,
    roi: 0,
    pontoEquilibrio: 0
  });

  const calcular = () => {
    // 1. Desempenho Zootécnico
    const kgGanhos = gmd * diasCiclo;
    const pesoVivo = pesoInicial + kgGanhos;
    const pesoCarcaca = pesoVivo * (rendimento / 100);
    const pesoArroba = pesoCarcaca / 15;

    // 2. Custos por Cabeça
    const nutricaoTotal = suplementoDia * diasCiclo;
    const terraTotal = (arrendamentoMes / 30) * diasCiclo;
    const sanidadeTotalCiclo = (sanidadeMes / 30) * diasCiclo; // Cálculo mensal para o ciclo
    const maoDeObraTotalCiclo = ((maoDeObraMes / 30) * diasCiclo) / qtdAnimais;
    
    const custoInvestidoCabeca = compraValor + nutricaoTotal + terraTotal + maoDeObraTotalCiclo + sanidadeTotalCiclo;
    const custoTotalLote = custoInvestidoCabeca * qtdAnimais;

    // 3. Receita (Baseada no Toggle)
    const animaisVivos = qtdAnimais * (1 - (mortalidade / 100));
    const receitaLoteReal = unidadeVenda === 'arroba' 
      ? (animaisVivos * pesoArroba) * vendaValor
      : (animaisVivos * pesoVivo) * vendaValor; // Venda por kg Vivo
    
    // 4. Lucros e Margens
    const lucroLote = receitaLoteReal - custoTotalLote;
    const lucroCabeca = lucroLote / qtdAnimais;
    const roiPercentual = (lucroLote / custoTotalLote) * 100;
    const pe = custoInvestidoCabeca / pesoArroba;

    setResultados({
      pesoFinalVivo: pesoVivo,
      pesoFinalCarcaca: pesoCarcaca,
      pesoFinalArroba: pesoArroba,
      custoNutricao: nutricaoTotal,
      custoTerra: terraTotal,
      custoSanidade: sanidadeTotalCiclo,
      custoMaoDeObra: maoDeObraTotalCiclo,
      custoTotalCabeca: custoInvestidoCabeca,
      custoTotalLote: custoTotalLote,
      receitaLiquidaLote: receitaLoteReal,
      lucroLiquidoCabeca: lucroCabeca,
      lucroLiquidoLote: lucroLote,
      roi: roiPercentual,
      pontoEquilibrio: pe
    });
  };

  useEffect(() => {
    calcular();
  }, [qtdAnimais, compraValor, pesoInicial, gmd, diasCiclo, suplementoDia, arrendamentoMes, maoDeObraMes, sanidadeMes, vendaValor, unidadeVenda, rendimento, mortalidade]);

  const f = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Layout original preservado */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-green-700 dark:bg-green-600 rounded-lg text-white">
                <Calculator size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Painel de Viabilidade Pecuária</h1>
            </div>
            <p className="text-slate-500 dark:text-gray-400 flex items-center gap-1 text-sm font-medium">
              <MapPin size={14} className="text-green-600 dark:text-green-400" />
              Projeção Regional: Nortão de Mato Grosso
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-gray-700 px-4 py-2 rounded-xl border border-slate-100 dark:border-gray-600">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 dark:text-gray-400 uppercase font-bold tracking-wider">Tamanho do Lote</p>
              <p className="text-lg font-bold text-slate-700 dark:text-white">{qtdAnimais} Cabeças</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-gray-600"></div>
            <div className="text-right text-green-700 dark:text-green-400">
              <p className="text-[10px] text-slate-400 dark:text-gray-400 uppercase font-bold tracking-wider">ROI Previsto</p>
              <p className="text-lg font-bold">{resultados.roi.toFixed(1)}%</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Lado Esquerdo (Inputs) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Seção 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-white">
                <Layers size={20} className="text-green-600 dark:text-green-400" /> 1. Dimensionamento do Lote e Compra
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Quantidade de Animais</label>
                  <input type="number" value={qtdAnimais} onChange={(e) => setQtdAnimais(Math.max(1, Number(e.target.value)))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Valor de Compra (R$/Cab)</label>
                  <input type="number" value={compraValor} onChange={(e) => setCompraValor(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Peso Médio Inicial (kg)</label>
                  <input type="number" value={pesoInicial} onChange={(e) => setPesoInicial(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>

            {/* Seção 2 - Alteração da Sanidade Mensal */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-white">
                <Activity size={20} className="text-green-600 dark:text-green-400" /> 2. Manejo e Custos Fixos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">GMD (Ganho Diário kg)</label>
                  <input type="number" step="0.01" value={gmd} onChange={(e) => setGmd(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-green-700 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Período (Dias)</label>
                  <input type="number" value={diasCiclo} onChange={(e) => setDiasCiclo(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Suplemento (R$/dia)</label>
                  <input type="number" step="0.10" value={suplementoDia} onChange={(e) => setSuplementoDia(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Folha de Pagamento Lote (R$/mês)</label>
                  <input type="number" value={maoDeObraMes} onChange={(e) => setMaoDeObraMes(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Arrendamento (R$/cab/mês)</label>
                  <input type="number" value={arrendamentoMes} onChange={(e) => setArrendamentoMes(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  {/* ALTERAÇÃO 1: Sanidade por Mês */}
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Sanidade (R$/cab/mês)</label>
                  <input type="number" value={sanidadeMes} onChange={(e) => setSanidadeMes(Number(e.target.value))} className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Mortalidade Estimada (%)</label>
                  <input type="number" value={mortalidade} onChange={(e) => setMortalidade(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-red-700 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Seção 3 - Toggle de Preço de Venda */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-white">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" /> 3. Mercado e Receita
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Rendimento Carcaça (%)</label>
                  <input type="number" value={rendimento} onChange={(e) => setRendimento(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    {/* ALTERAÇÃO 2: Toggle Arroba vs Quilo */}
                    <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Preço Venda</label>
                    <div className="flex bg-slate-100 dark:bg-gray-700 p-1 rounded-lg scale-90">
                      <button onClick={() => setUnidadeVenda('arroba')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${unidadeVenda === 'arroba' ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm' : 'text-slate-400 dark:text-gray-500'}`}>POR @</button>
                      <button onClick={() => setUnidadeVenda('kg')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${unidadeVenda === 'kg' ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm' : 'text-slate-400 dark:text-gray-500'}`}>POR KG</button>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 font-bold">R$</span>
                    <input type="number" value={vendaValor} onChange={(e) => setVendaValor(Number(e.target.value))} className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl pl-12 pr-4 py-3 text-green-900 dark:text-green-400 font-bold focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito (Resultados) - Layout original preservado */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-800 dark:bg-gray-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border dark:border-gray-700">
              <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={100} /></div>
              <p className="text-slate-400 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Lucro Líquido do Lote</p>
              <h2 className="text-4xl font-black mb-1">{f(resultados.lucroLiquidoLote)}</h2>
              <p className="text-green-400 dark:text-green-300 text-sm font-medium mb-6">Equivale a {f(resultados.lucroLiquidoCabeca)} / cab</p>
              <div className="space-y-4 pt-4 border-t border-slate-700 dark:border-gray-600 text-sm">
                <div className="flex justify-between"><span>Receita Total Lote</span><span className="font-bold">{f(resultados.receitaLiquidaLote)}</span></div>
                <div className="flex justify-between"><span>ROI Previsto</span><span className={`px-2 py-0.5 rounded-full font-bold bg-green-500 dark:bg-green-600 text-white text-xs`}>{resultados.roi.toFixed(2)}%</span></div>
              </div>
            </div>

            {/* ALTERAÇÃO 3: Métricas de Produção com distinção Vivo vs Carcaça */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700">
              <h4 className="text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-4">Métricas de Produção</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-50 dark:bg-gray-700 p-3 rounded-xl border border-slate-100 dark:border-gray-600">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase">Peso Vivo</p>
                  <p className="text-base font-bold text-slate-700 dark:text-white">{resultados.pesoFinalVivo.toFixed(0)} kg</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-700 p-3 rounded-xl border border-slate-100 dark:border-gray-600">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase">Peso Carcaça</p>
                  <p className="text-base font-bold text-slate-700 dark:text-white">{resultados.pesoFinalCarcaca.toFixed(1)} kg</p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-700 text-center">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Total @ por Animal</p>
                <p className="text-2xl font-black text-green-800 dark:text-green-300">{resultados.pesoFinalArroba.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 text-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Composição de Custo / Cabeça</h4>
              <div className="flex justify-between text-slate-900 dark:text-white"><span>Animal (Compra)</span><span>{f(compraValor)}</span></div>
              <div className="flex justify-between text-slate-900 dark:text-white"><span>Nutrição</span><span className="text-orange-600 dark:text-orange-400">{f(resultados.custoNutricao)}</span></div>
              <div className="flex justify-between text-slate-900 dark:text-white"><span>Sanidade</span><span className="text-blue-600 dark:text-blue-400">{f(resultados.custoSanidade)}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-gray-600 font-bold text-slate-900 dark:text-white"><span>Custo Total / Cab</span><span className="text-red-600 dark:text-red-400">{f(resultados.custoTotalCabeca)}</span></div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-5 rounded-2xl flex gap-3">
              <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" size={20} />
              <div>
                <h5 className="text-amber-800 dark:text-amber-300 font-bold text-sm">Atenção ao Mercado</h5>
                <p className="text-amber-700 dark:text-amber-200 text-xs mt-1 leading-relaxed">Para o lote ser rentável, a arroba deve ser vendida por no mínimo <strong>{f(resultados.pontoEquilibrio)}</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estimativa;