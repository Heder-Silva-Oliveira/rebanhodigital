import { Planning } from '../model/Planning.model.js';

export const list = async (req, res) => {
  try { 
    console.log(`[PLANNING] Listando planejamentos para tenant: ${req.user.tenantId}`);
    const plans = await Planning.find({ tenantId: req.user.tenantId }).sort({ startDate: -1 });
    console.log(`[PLANNING] Encontrados ${plans.length} planejamentos`);
    res.json(plans); 
  } catch (err) { 
    console.error('[PLANNING] Erro ao buscar:', err);
    res.status(500).json({ error: 'Erro ao buscar' }); 
  }
};

export const create = async (req, res) => {
  try { 
    console.log('[PLANNING] Criando novo planejamento:', req.body);
    const planningData = {
      ...req.body,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('[PLANNING] Dados para criação:', planningData);
    const created = await Planning.create(planningData);
    console.log('[PLANNING] Planejamento criado com sucesso:', created._id);
    res.status(201).json(created); 
  } catch (err) { 
    console.error('[PLANNING] Erro ao criar:', err);
    res.status(400).json({ error: err.message }); 
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PLANNING] Atualizando planejamento ${id}:`, req.body);
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updated = await Planning.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      console.log(`[PLANNING] Planejamento ${id} não encontrado`);
      return res.status(404).json({ error: 'Planejamento não encontrado' });
    }
    
    console.log('[PLANNING] Planejamento atualizado com sucesso:', updated._id);
    res.json(updated);
  } catch (err) {
    console.error('[PLANNING] Erro ao atualizar:', err);
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PLANNING] Removendo planejamento ${id}`);
    
    const deleted = await Planning.findOneAndDelete({
      _id: id,
      tenantId: req.user.tenantId
    });
    
    if (!deleted) {
      console.log(`[PLANNING] Planejamento ${id} não encontrado para remoção`);
      return res.status(404).json({ error: 'Planejamento não encontrado' });
    }
    
    console.log('[PLANNING] Planejamento removido com sucesso:', deleted._id);
    res.json({ message: 'Planejamento excluído com sucesso' });
  } catch (err) {
    console.error('[PLANNING] Erro ao remover:', err);
    res.status(500).json({ error: err.message });
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PLANNING] Marcando planejamento ${id} como concluído`);
    
    const updated = await Planning.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      { 
        status: 'concluido',
        completionPercentage: 100,
        completedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updated) {
      console.log(`[PLANNING] Planejamento ${id} não encontrado para conclusão`);
      return res.status(404).json({ error: 'Planejamento não encontrado' });
    }
    
    console.log('[PLANNING] Planejamento marcado como concluído:', updated._id);
    res.json(updated);
  } catch (err) {
    console.error('[PLANNING] Erro ao marcar como concluído:', err);
    res.status(400).json({ error: err.message });
  }
};