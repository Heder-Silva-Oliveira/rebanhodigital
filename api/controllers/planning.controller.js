import { Planning } from '../models/Planning.model.js';

export const list = async (req, res) => {
  try { res.json(await Planning.find({ tenantId: req.user.tenantId }).sort({ startDate: -1 })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
};
export const create = async (req, res) => {
  try { res.status(201).json(await Planning.create({ ...req.body, tenantId: req.user.tenantId })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
};