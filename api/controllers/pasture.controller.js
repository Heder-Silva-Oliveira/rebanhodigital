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