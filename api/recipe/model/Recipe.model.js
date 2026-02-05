import mongoose from 'mongoose';

const EsquemaDeIngrediente = new mongoose.Schema({
  nomeDoIngrediente: { type: String, required: true },
  precoPorQuilo: { type: Number, required: true },
  quantidadeInclusao: { type: Number, required: true },
  proteinaBruta: { type: Number, required: true },
  materiaSeca: { type: Number, required: true }
});

const EsquemaDeReceita = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  identificadorDaReceita: { type: String, required: true }, // Ex: "dieta_001"
  nomeDaReceita: { type: String, required: true },
  metodoDeCalculo: { type: String, enum: ['porcentagem', 'peso'], default: 'porcentagem' },
  ingredientes: [EsquemaDeIngrediente],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Receita = mongoose.model('Receita', EsquemaDeReceita);