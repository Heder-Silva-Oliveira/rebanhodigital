import mongoose from 'mongoose';

const AnimalSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  id: String,
  animalId: String,
  name: String,
  species: String,
  breed: String,
  birthDate: Date,
  gender: String,
  weight: Number,
  status: String,
  healthStatus: String,
  location: String,
  purchasePrice: Number,
  purchaseDate: Date,
  notes: String,
  motherId: String,
  fatherId: String,
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Animal = mongoose.model('Animal', AnimalSchema);