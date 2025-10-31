import mongoose from 'mongoose';

const AnimalSchema = new mongoose.Schema({
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
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Evita erro de model recompilação no Next.js
export default mongoose.models.Animal || mongoose.model('Animal', AnimalSchema);