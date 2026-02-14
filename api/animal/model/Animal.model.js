import mongoose from 'mongoose';

const AnimalSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  id: String,
  name: String,
  breed: String,
  gender: String,
  birthDate: Date,
  weight: Number,
  status: String,
  pastureId: String,
  healthStatus: String,
  reproductiveStatus: String,
  acquisitionDate: Date,
  acquisitionPrice: Number,
  currentValue: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

export const Animal = mongoose.models.Animal || mongoose.model('Animal', AnimalSchema);