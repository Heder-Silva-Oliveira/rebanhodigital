import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Scale, ClipboardList, Database, FilePlus } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import toast from 'react-hot-toast';

interface InterfaceIngredienteLocal {
  identificadorUnico: number;
  nomeDoIngrediente: string;
  precoPorQuilo: number;
  quantidadeInclusao: number;
  proteinaBruta: number;
  materiaSeca: number;
}

interface InterfaceReceitaNutricional {
  id: string; 
  identificadorDaReceita: string; 
  nomeDaReceita: string;
  metodoDeCalculo: 'porcentagem' | 'peso';
  ingredientes: InterfaceIngredienteLocal[];
}

const FormuladorNutricional: React.FC = () => {
  const { 
    data: listaDeReceitasNoBanco, 
    createRecord: requisitarCriacaoNoBanco, 
    updateRecord: requisitarAtualizacaoNoBanco,
    loading: carregandoDadosDoServidor 
  } = useCRUD<InterfaceReceitaNutricional>({ entityName: 'recipes' });

  const [mongoIdEmEdicao, setMongoIdEmEdicao] = useState<string | null>(null);
  const [metodoDeCalculoAtivo, setMetodoDeCalculoAtivo] = useState<'porcentagem' | 'peso'>('porcentagem');
  const [nomeDaReceitaAtual, setNomeDaReceitaAtual] = useState('Minha Nova Dieta');
  const [colecaoDeIngredientes, setColecaoDeIngredientes] = useState<InterfaceIngredienteLocal[]>([
    { identificadorUnico: Date.now(), nomeDoIngrediente: 'Milho Grão', precoPorQuilo: 1.10, quantidadeInclusao: 100, proteinaBruta: 9, materiaSeca: 88 }
  ]);

  const iniciarNovaFormulacao = () => {
    setMongoIdEmEdicao(null);
    setNomeDaReceitaAtual('Nova Dieta');
    setColecaoDeIngredientes([{ identificadorUnico: Date.now(), nomeDoIngrediente: '', precoPorQuilo: 0, quantidadeInclusao: 0, proteinaBruta: 0, materiaSeca: 0 }]);
    toast.success('Formulário resetado.');
  };

  const carregarDadosParaEdicao = (receita: InterfaceReceitaNutricional) => {
    setMongoIdEmEdicao(receita.id);
    setNomeDaReceitaAtual(receita.nomeDaReceita);
    setMetodoDeCalculoAtivo(receita.metodoDeCalculo);
    const ingredientesFormatados = receita.ingredientes.map(item => ({
      ...item,
      identificadorUnico: item.identificadorUnico || Math.random()
    }));
    setColecaoDeIngredientes(ingredientesFormatados);
    toast.success(`Editando: ${receita.nomeDaReceita}`);
  };

  const indicadoresCalculados = useMemo(() => {
    let custoAcumuladoPorQuilo = 0;
    let proteinaTotalPonderada = 0;
    let materiaSecaTotalPonderada = 0;

    const somaTotalInclusao = colecaoDeIngredientes.reduce((acumulador, item) => acumulador + (Number(item.quantidadeInclusao) || 0), 0);

    colecaoDeIngredientes.forEach(item => {
      const valorInclusao = Number(item.quantidadeInclusao) || 0;
      const proporcaoNoLote = metodoDeCalculoAtivo === 'porcentagem' 
        ? valorInclusao / 100 
        : (somaTotalInclusao > 0 ? valorInclusao / somaTotalInclusao : 0);
      
      custoAcumuladoPorQuilo += (Number(item.precoPorQuilo) || 0) * proporcaoNoLote;
      proteinaTotalPonderada += (Number(item.proteinaBruta) || 0) * proporcaoNoLote;
      materiaSecaTotalPonderada += (Number(item.materiaSeca) || 0) * proporcaoNoLote;
    });

    return { 
      somaDasInclusoes: somaTotalInclusao, 
      custoFinalKg: custoAcumuladoPorQuilo, 
      proteinaFinal: proteinaTotalPonderada, 
      materiaSecaFinal: materiaSecaTotalPonderada 
    };
  }, [colecaoDeIngredientes, metodoDeCalculoAtivo]);

  // ✅ CORREÇÃO: Nome da função sincronizado com o onClick do botão
  const persistirDadosNutricionais = async () => {
    if (metodoDeCalculoAtivo === 'porcentagem' && Math.round(indicadoresCalculados.somaDasInclusoes) !== 100) {
      toast.error('A inclusão deve totalizar 100%!');
      return;
    }

    const payloadFormatado = {
      nomeDaReceita: nomeDaReceitaAtual,
      metodoDeCalculo: metodoDeCalculoAtivo,
      identificadorDaReceita: mongoIdEmEdicao || `dieta_tec_${Date.now()}`,
      ingredientes: colecaoDeIngredientes.map(item => ({
        nomeDoIngrediente: item.nomeDoIngrediente,
        precoPorQuilo: Number(item.precoPorQuilo),
        quantidadeInclusao: Number(item.quantidadeInclusao),
        proteinaBruta: Number(item.proteinaBruta),
        materiaSeca: Number(item.materiaSeca)
      }))
    };

    try {
      if (mongoIdEmEdicao) {
        await requisitarAtualizacaoNoBanco(mongoIdEmEdicao, payloadFormatado);
        toast.success('Registro técnico atualizado.');
      } else {
        await requisitarCriacaoNoBanco(payloadFormatado);
        toast.success('Nova formulação salva no MongoDB.');
      }
    } catch (erro) {
      toast.error('Erro na sincronização de dados.');
    }
  };

  const modificarPropriedadeDoIngrediente = (idUnico: number, campo: keyof InterfaceIngredienteLocal, novoValor: string | number) => {
    setColecaoDeIngredientes(prev => prev.map(item => 
      item.identificadorUnico === idUnico ? { ...item, [campo]: novoValor } : item
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-gray-700 mb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><Database size={24} /></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Formulação Inteligente</h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm">MongoDB Atlas Sync Ativo</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={iniciarNovaFormulacao} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-300 rounded-xl font-bold text-xs transition-all">
              <FilePlus size={16} /> NOVA DIETA
            </button>
            <div className="bg-slate-100 dark:bg-gray-700 p-1 rounded-2xl flex border border-slate-200 dark:border-gray-600">
              <button onClick={() => setMetodoDeCalculoAtivo('porcentagem')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${metodoDeCalculoAtivo === 'porcentagem' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-gray-400'}`}>% PORCENTAGEM</button>
              <button onClick={() => setMetodoDeCalculoAtivo('peso')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${metodoDeCalculoAtivo === 'peso' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-gray-400'}`}>KG BATIDA</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-gray-700 flex items-center justify-between">
                <input 
                  value={nomeDaReceitaAtual}
                  onChange={(e) => setNomeDaReceitaAtual(e.target.value)}
                  className="bg-transparent border-b-2 border-slate-100 dark:border-gray-600 text-2xl font-black focus:border-blue-500 outline-none pb-2 w-full max-w-lg transition-colors text-slate-800 dark:text-white"
                />
                <button 
                  onClick={() => setColecaoDeIngredientes([...colecaoDeIngredientes, { identificadorUnico: Date.now(), nomeDoIngrediente: '', precoPorQuilo: 0, quantidadeInclusao: 0, proteinaBruta: 0, materiaSeca: 0 }])}
                  className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-gray-700 text-[10px] uppercase font-black text-slate-400 dark:text-gray-300 tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Ingrediente</th>
                      <th className="px-4 py-5 text-center">R$/kg</th>
                      <th className="px-4 py-5 text-center">{metodoDeCalculoAtivo === 'porcentagem' ? '%' : 'kg'}</th>
                      <th className="px-4 py-5 text-center text-blue-600 dark:text-blue-400">PB (%)</th>
                      <th className="px-4 py-5 text-center text-emerald-600 dark:text-emerald-400">MS (%)</th>
                      <th className="px-8 py-5 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                    {colecaoDeIngredientes.map((item) => (
                      <tr key={item.identificadorUnico} className="group hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-8 py-4">
                          <input value={item.nomeDoIngrediente} onChange={(e) => modificarPropriedadeDoIngrediente(item.identificadorUnico, 'nomeDoIngrediente', e.target.value)} className="bg-transparent font-bold text-slate-700 dark:text-gray-300 outline-none w-full" />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" step="0.01" value={item.precoPorQuilo} onChange={(e) => modificarPropriedadeDoIngrediente(item.identificadorUnico, 'precoPorQuilo', Number(e.target.value))} className="w-16 text-center bg-slate-100 dark:bg-gray-600 rounded-lg p-1.5 text-xs font-bold outline-none text-slate-700 dark:text-gray-300" />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" value={item.quantidadeInclusao} onChange={(e) => modificarPropriedadeDoIngrediente(item.identificadorUnico, 'quantidadeInclusao', Number(e.target.value))} className={`w-16 text-center rounded-lg p-1.5 text-xs font-black outline-none ${metodoDeCalculoAtivo === 'porcentagem' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`} />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" value={item.proteinaBruta} onChange={(e) => modificarPropriedadeDoIngrediente(item.identificadorUnico, 'proteinaBruta', Number(e.target.value))} className="w-12 text-center bg-slate-50 dark:bg-gray-600 rounded-lg p-1 text-xs text-blue-700 dark:text-blue-400 font-bold outline-none" />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" value={item.materiaSeca} onChange={(e) => modificarPropriedadeDoIngrediente(item.identificadorUnico, 'materiaSeca', Number(e.target.value))} className="w-12 text-center bg-slate-50 dark:bg-gray-600 rounded-lg p-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold outline-none" />
                        </td>
                        <td className="px-8 py-4 text-center">
                          <button onClick={() => setColecaoDeIngredientes(colecaoDeIngredientes.filter(i => i.identificadorUnico !== item.identificadorUnico))} className="text-slate-300 dark:text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-slate-400 text-[10px] font-black uppercase mb-8 tracking-widest flex justify-between">Análise da Dieta <Scale size={16}/></h3>
              
              <div className="space-y-8 mb-10">
                <div>
                  <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-tighter"><span>Nível PB</span><span className="text-blue-400 text-lg">{indicadoresCalculados.proteinaFinal.toFixed(1)}%</span></div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(indicadoresCalculados.proteinaFinal * 3, 100)}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-tighter"><span>Nível MS</span><span className="text-emerald-400 text-lg">{indicadoresCalculados.materiaSecaFinal.toFixed(1)}%</span></div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${indicadoresCalculados.materiaSecaFinal}%` }}></div></div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-3xl mb-8 border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Custo Médio kg</p>
                <p className="text-4xl font-black text-white">R$ {indicadoresCalculados.custoFinalKg.toFixed(2)}</p>
              </div>

              {/* ✅ BOTÃO CORRIGIDO */}
              <button 
                onClick={persistirDadosNutricionais} 
                disabled={carregandoDadosDoServidor} 
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/40 disabled:opacity-50"
              >
                <Save size={20} /> {mongoIdEmEdicao ? 'ATUALIZAR REGISTRO' : 'SALVAR NO MONGODB'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ClipboardList size={14}/> Histórico Atlas</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {listaDeReceitasNoBanco.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-gray-500 italic text-center py-8">Nenhuma dieta salva.</p>
                ) : (
                  listaDeReceitasNoBanco.map((receita) => (
                    // ✅ KEY ADICIONADA para resolver o aviso do React
                    <button 
                      key={receita.id} 
                      onClick={() => carregarDadosParaEdicao(receita)}
                      className={`w-full text-left flex justify-between items-center p-4 rounded-2xl border transition-all group ${mongoIdEmEdicao === receita.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm' : 'bg-slate-50 dark:bg-gray-700 border-slate-100 dark:border-gray-600 hover:border-slate-200 dark:hover:border-gray-500'}`}
                    >
                      <div className="max-w-[75%]">
                        <p className="text-sm font-black text-slate-700 dark:text-gray-300 truncate">{receita.nomeDaReceita}</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase">{receita.metodoDeCalculo}</p>
                      </div>
                      <div className={`p-2 rounded-xl transition-all ${mongoIdEmEdicao === receita.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 shadow-sm'}`}>
                        <Plus size={14} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormuladorNutricional;