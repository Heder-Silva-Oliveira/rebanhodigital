import mongoose from 'mongoose';

const WeighingRecordSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  id: String,
  animalId: String,
  weight: Number,
  date: Date,
  notes: String,
  measuredBy: String,
  location: String,
  purpose: String,
  created_at: Date
});

export const WeighingRecord = mongoose.model('WeighingRecord', WeighingRecordSchema);