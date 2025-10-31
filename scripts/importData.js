import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Conecta ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
await mongoose.connect(MONGODB_URI);
console.log('✅ Conectado ao MongoDB');

// Schemas
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
  motherId: String,
  fatherId: String,
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  id: String,
  email: String,
  password: String,
  name: String,
  role: String
});

const FinancialSchema = new mongoose.Schema({
  id: String,
  transactionId: String,
  type: String,
  category: String,
  subcategory: String,
  amount: Number,
  description: String,
  date: String,
  paymentMethod: String,
  status: String,
  tags: [String],
  notes: String,
  createdAt: Date,
  relatedEntity: String,
  relatedEntityId: String,
  updatedAt: Date
});

const PastureSchema = new mongoose.Schema({
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

const PlanningSchema = new mongoose.Schema({
  id: String,
  planId: String,
  title: String,
  description: String,
  type: String,
  startDate: Date,
  endDate: Date,
  status: String,
  priority: String,
  assignedTo: String,
  relatedAnimals: [String],
  relatedPastures: [String],
  estimatedCost: Number,
  actualCost: Number,
  completionPercentage: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

const WeighingRecordSchema = new mongoose.Schema({
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

// Models
const Animal = mongoose.model('Animal', AnimalSchema);
const User = mongoose.model('User', UserSchema);
const Financial = mongoose.model('Financial', FinancialSchema);
const Pasture = mongoose.model('Pasture', PastureSchema);
const Planning = mongoose.model('Planning', PlanningSchema);
const WeighingRecord = mongoose.model('WeighingRecord', WeighingRecordSchema);

// Lê o db.json
const dbData = JSON.parse(readFileSync('./db.json', 'utf8'));

// Importa dados
async function importData() {
  try {
    console.log('🚀 Iniciando importação de dados...');

    // Limpa collections existentes
    await Animal.deleteMany({});
    await User.deleteMany({});
    await Financial.deleteMany({});
    await Pasture.deleteMany({});
    await Planning.deleteMany({});
    await WeighingRecord.deleteMany({});

    // Importa animais
    if (dbData.animals && dbData.animals.length > 0) {
      await Animal.insertMany(dbData.animals);
      console.log(`✅ ${dbData.animals.length} animais importados`);
    }

    // Importa usuários
    if (dbData.users && dbData.users.length > 0) {
      await User.insertMany(dbData.users);
      console.log(`✅ ${dbData.users.length} usuários importados`);
    }

    // Importa transações financeiras
    if (dbData.financial_transactions && dbData.financial_transactions.length > 0) {
      await Financial.insertMany(dbData.financial_transactions);
      console.log(`✅ ${dbData.financial_transactions.length} transações financeiras importadas`);
    }

    // Importa pastagens
    if (dbData.pastures && dbData.pastures.length > 0) {
      await Pasture.insertMany(dbData.pastures);
      console.log(`✅ ${dbData.pastures.length} pastagens importadas`);
    }

    // Importa planejamentos
    if (dbData.planning && dbData.planning.length > 0) {
      await Planning.insertMany(dbData.planning);
      console.log(`✅ ${dbData.planning.length} planejamentos importados`);
    }

    // Importa registros de pesagem
    if (dbData.weighing_records && dbData.weighing_records.length > 0) {
      await WeighingRecord.insertMany(dbData.weighing_records);
      console.log(`✅ ${dbData.weighing_records.length} registros de pesagem importados`);
    }

    console.log('🎉 Importação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

importData();