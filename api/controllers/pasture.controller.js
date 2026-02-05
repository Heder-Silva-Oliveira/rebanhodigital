import { Pasture } from '../models/Pasture.model.js';
import { PLAN_LIMITS } from '../config/plans.js';

export const list = async (req, res) => {
  try { res.json(await Pasture.find({ tenantId: req.user.tenantId })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
};

export const create = async (req, res) => {
  try {
    const { plan, tenantId } = req.user;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic; 
    const count = await Pasture.countDocuments({ tenantId });
    if (count >= limits.pastures) return res.status(403).json({ message: `Limite de ${limits.pastures} pastagens atingido.` });
    
    const newData = await Pasture.create({ ...req.body, tenantId });
    res.status(201).json(newData);
  } catch (err) { res.status(400).json({ error: err.message }); }
};
// Adicione esta função ao seu controller
export const update = async (req, res) => {
  try {
    const { id } = req.params; // Recebe "ca54"
    const tenantId = req.user.tenantId; // Garanta que o tenantId do usuário logado é "1"

    // IMPORTANTE: Buscamos pelo campo 'id' que é String, não pelo '_id'
    const updatedData = await Pasture.findOneAndUpdate(
      { id: id, tenantId: tenantId }, 
      { $set: req.body },
      { new: true, runValidators: true } // new: true traz o objeto atualizado
    );

    if (!updatedData) {
      return res.status(404).json({ 
        error: 'Pastagem não encontrada ou você não tem permissão para editá-la.' 
      });
    }

    res.json(updatedData);
  } catch (err) {
    console.error("Erro no update:", err);
    res.status(400).json({ error: 'Erro ao atualizar: ' + err.message });
  }
};