import { WeighingRecord } from '../models/WeighingRecord.model.js';

export const list = async (req, res) => {
  try { res.json(await WeighingRecord.find({ tenantId: req.user.tenantId }).sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ error: 'Erro ao buscar' }); }
};
export const create = async (req, res) => {
  try { res.status(201).json(await WeighingRecord.create({ ...req.body, tenantId: req.user.tenantId, created_at: new Date() })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
};