import mongoose from 'mongoose';

const FinancialSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
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

export const Financial = mongoose.models.Financial || mongoose.model('Financial', FinancialSchema);