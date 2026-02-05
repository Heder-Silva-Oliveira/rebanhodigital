import { Receita } from '../models/Recipe.model.js';
import { PLAN_LIMITS } from '../config/plans.js';

/**
 * Recupera todas as receitas associadas à fazenda do usuário autenticado.
 */
export const listarReceitas = async (requisicao, resposta) => {
  try {
    const { tenantId } = requisicao.user;

    // Busca otimizada utilizando o índice do tenantId
    const receitasLocalizadas = await Receita.find({ tenantId })
      .sort({ createdAt: -1 }) // Mais recentes primeiro
      .lean(); // Aumenta a performance ignorando métodos do Mongoose

    return resposta.status(200).json(receitasLocalizadas);
  } catch (erro) {
    return resposta.status(500).json({ 
      mensagem: 'Falha interna ao recuperar o histórico de formulações.',
      detalhe: erro.message 
    });
  }
};

/**
 * Cria uma nova formulação nutricional validando os limites do plano contratado.
 */
export const criarReceita = async (requisicao, resposta) => {
  try {
    const { plan, tenantId } = requisicao.user;
    
    // 1. Validação de Regras de Negócio (Limites do SaaS)
    const limitesDoPlanoContratado = PLAN_LIMITS[plan] || PLAN_LIMITS.basic; 
    const quantidadeDeReceitasAtuais = await Receita.countDocuments({ tenantId });

    if (quantidadeDeReceitasAtuais >= limitesDoPlanoContratado.recipes) {
      return resposta.status(403).json({ 
        mensagem: `Limite atingido. Seu plano (${plan}) permite apenas ${limitesDoPlanoContratado.recipes} receitas.` 
      });
    }
    
    // 2. Persistência dos dados com injeção forçada do tenantId para segurança
    const novaDietaFormatada = new Receita({
      ...requisicao.body,
      tenantId: tenantId,
      createdAt: new Date()
    });

    const receitaSalvaNoBanco = await novaDietaFormatada.save();
    
    return resposta.status(201).json(receitaSalvaNoBanco);
  } catch (erro) { 
    return resposta.status(400).json({ 
      mensagem: 'Os dados da formulação são inválidos ou incompletos.',
      erro: erro.message 
    }); 
  }
};

/**
 * Atualiza uma formulação existente baseada no identificador técnico customizado.
 */
export const atualizarReceita = async (requisicao, resposta) => {
  try {
    const { id: identificadorUrl } = requisicao.params;
    const { tenantId } = requisicao.user;

    // Filtro composto obrigatório para garantir isolamento multi-tenant
    const filtroDeSeguranca = { 
      identificadorDaReceita: identificadorUrl, 
      tenantId: tenantId 
    };

    const dadosParaAtualizar = { 
      ...requisicao.body, 
      updatedAt: new Date() 
    };

    const receitaAtualizada = await Receita.findOneAndUpdate(
      filtroDeSeguranca,
      { $set: dadosParaAtualizar },
      { 
        new: true,           // Retorna o documento já modificado
        runValidators: true, // Garante que as Proteínas e Matérias Secas sejam números
        context: 'query' 
      }
    );

    if (!receitaAtualizada) {
      return resposta.status(404).json({ 
        mensagem: 'Formulação não encontrada ou você não possui permissão para editá-la.' 
      });
    }

    return resposta.status(200).json(receitaAtualizada);
  } catch (erro) {
    return resposta.status(400).json({ 
      mensagem: 'Erro crítico na atualização dos dados nutricionais.',
      detalhe: erro.message 
    });
  }
};