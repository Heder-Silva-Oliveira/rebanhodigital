import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['alerta', 'lembrete', 'informacao', 'urgente', 'sistema'],
    default: 'informacao'
  },
  category: {
    type: String,
    required: true,
    enum: ['saude_animal', 'estoque', 'financeiro', 'planejamento', 'sistema', 'outros'],
    default: 'outros'
  },
  priority: {
    type: String,
    required: true,
    enum: ['baixa', 'media', 'alta', 'critica'],
    default: 'media'
  },
  status: {
    type: String,
    required: true,
    enum: ['nao_lida', 'lida', 'arquivada', 'resolvida'],
    default: 'nao_lida'
  },
  targetUser: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  relatedEntity: {
    type: String, // 'animal', 'financial', 'planning', etc.
    default: null
  },
  relatedEntityId: {
    type: String, // ID da entidade relacionada
    default: null
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String, // URL para onde o usuário deve ir para resolver
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null // Para notificações agendadas
  },
  readAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Dados extras específicos do alerta
    default: {}
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Índices para performance
notificationSchema.index({ targetUser: 1, tenantId: 1 });
notificationSchema.index({ status: 1, priority: 1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });

// Middleware para definir tenantId automaticamente se não fornecido
notificationSchema.pre('save', function(next) {
  if (!this.tenantId && this.targetUser) {
    this.tenantId = this.targetUser; // Assumindo que targetUser é o tenantId
  }
  next();
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);