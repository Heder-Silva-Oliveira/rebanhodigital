import { Animal } from '../models/Animal.model.js';
import { PLAN_LIMITS } from '../config/plans.js';

export const list = async (req, res) => {
  try {
    const animals = await Animal.find({ tenantId: req.user.tenantId }).sort({ created_at: -1 });
    res.json({ animals });
  } catch (err) { res.status(500).json({ error: 'Erro ao buscar animais' }); }
};

export const getById = async (req, res) => {
  try {
    const item = await Animal.findOne({ id: req.params.id, tenantId: req.user.tenantId });
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const create = async (req, res) => {
  try {
    const { plan, tenantId } = req.user;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic; 
    
    const count = await Animal.countDocuments({ tenantId });
    if (count >= limits.animals) {
        return res.status(403).json({ message: `Limite de ${limits.animals} animais atingido.` });
    }

    const newAnimal = await Animal.create({
      ...req.body,
      tenantId,
      id: req.body.id || `anim_${Date.now()}`,
      created_at: new Date()
    });
    res.status(201).json(newAnimal);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const update = async (req, res) => {
  try {
    const item = await Animal.findOneAndUpdate(
        { id: req.params.id, tenantId: req.user.tenantId },
        { ...req.body, updatedAt: new Date() },
        { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const remove = async (req, res) => {
  try {
    const item = await Animal.findOneAndDelete({ id: req.params.id, tenantId: req.user.tenantId });
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};