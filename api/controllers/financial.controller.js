import { Financial } from '../models/Financial.model.js';
import { Animal } from '../models/Animal.model.js';

export const list = async (req, res) => {
  try { res.json(await Financial.find({ tenantId: req.user.tenantId }).sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
};

export const create = async (req, res) => {
  try { res.status(201).json(await Financial.create({ ...req.body, tenantId: req.user.tenantId })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
};

export const getCompanyHealth = async (req, res) => {
    try {
        const totalAnimals = await Animal.countDocuments({ tenantId: req.user.tenantId });
        const totalFinancials = await Financial.countDocuments({ tenantId: req.user.tenantId });
        res.json({ message: "Acesso Pro OK", dataPoints: totalAnimals + totalFinancials });
    } catch (err) { res.status(500).json({ error: err.message }); }
};