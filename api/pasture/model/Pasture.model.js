import mongoose from 'mongoose';

const PastureSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  id: String,
  pastureId: String,
  name: String,
  area: Number,
  capacity: Number,
  currentAnimals: Number,
  status: String,
  grassType: String,
  lastRotation: Date,
  nextRotation: Date,
  soilQuality: String,
  waterSource: Boolean,
  fencing: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

export const Pasture = mongoose.models.Pasture || mongoose.model('Pasture', PastureSchema);