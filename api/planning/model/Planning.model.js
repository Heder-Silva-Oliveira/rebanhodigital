import mongoose from 'mongoose';

const PlanningSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  planId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    default: 'planejado'
  },
  priority: { 
    type: String, 
    required: true,
    default: 'media'
  },
  assignedTo: { type: String, required: true },
  relatedAnimals: [{ type: String }],
  relatedPastures: [{ type: String }],
  estimatedCost: { type: Number, required: true, min: 0 },
  actualCost: { type: Number, default: 0, min: 0 },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// Índices para melhor performance
PlanningSchema.index({ tenantId: 1, startDate: -1 });
PlanningSchema.index({ tenantId: 1, status: 1 });
PlanningSchema.index({ tenantId: 1, type: 1 });

export const Planning = mongoose.model('Planning', PlanningSchema);