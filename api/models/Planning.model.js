import mongoose from 'mongoose';

const PlanningSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
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

export const Planning = mongoose.model('Planning', PlanningSchema);