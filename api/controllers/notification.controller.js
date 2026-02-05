import { Notification } from '../models/Notification.model.js';
import { generateAllAlerts } from '../services/notification.service.js';

// Listar notificações do usuário
export const getNotifications = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 50, 
      type, 
      category, 
      status, 
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filters = { tenantId };
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    // Construir ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Buscar notificações com paginação
    const notifications = await Notification.find(filters)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Contar total para paginação
    const total = await Notification.countDocuments(filters);

    // Estatísticas
    const stats = await Notification.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          naoLidas: { $sum: { $cond: [{ $eq: ['$status', 'nao_lida'] }, 1, 0] } },
          urgentes: { $sum: { $cond: [{ $and: [{ $eq: ['$priority', 'critica'] }, { $eq: ['$status', 'nao_lida'] }] }, 1, 0] } },
          acaoRequerida: { $sum: { $cond: [{ $and: ['$actionRequired', { $eq: ['$status', 'nao_lida'] }] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      stats: stats[0] || { total: 0, naoLidas: 0, urgentes: 0, acaoRequerida: 0 }
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar nova notificação
export const createNotification = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    
    const notificationData = {
      ...req.body,
      targetUser: userId,
      tenantId
    };

    const notification = await Notification.create(notificationData);
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar notificação (marcar como lida, resolvida, etc.)
export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const updateData = req.body;

    // Adicionar timestamps automáticos
    if (updateData.status === 'lida' && !updateData.readAt) {
      updateData.readAt = new Date();
    }
    if (updateData.status === 'resolvida' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, tenantId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Excluir notificação
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const notification = await Notification.findOneAndDelete({ _id: id, tenantId });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    res.json({ message: 'Notificação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Marcar múltiplas notificações como lidas
export const markMultipleAsRead = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'IDs de notificações são obrigatórios' });
    }

    const result = await Notification.updateMany(
      { 
        _id: { $in: notificationIds }, 
        tenantId,
        status: 'nao_lida'
      },
      { 
        status: 'lida',
        readAt: new Date(),
        updatedAt: new Date()
      }
    );

    res.json({ 
      message: `${result.modifiedCount} notificações marcadas como lidas`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter estatísticas de notificações para o dashboard
export const getNotificationStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const stats = await Notification.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          naoLidas: { $sum: { $cond: [{ $eq: ['$status', 'nao_lida'] }, 1, 0] } },
          urgentes: { $sum: { $cond: [{ $and: [{ $eq: ['$priority', 'critica'] }, { $eq: ['$status', 'nao_lida'] }] }, 1, 0] } },
          acaoRequerida: { $sum: { $cond: [{ $and: ['$actionRequired', { $eq: ['$status', 'nao_lida'] }] }, 1, 0] } }
        }
      }
    ]);

    // Buscar alertas recentes para o dashboard
    const recentAlerts = await Notification.find({
      tenantId,
      status: 'nao_lida',
      $or: [
        { priority: 'critica' },
        { priority: 'alta' },
        { actionRequired: true }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    res.json({
      stats: stats[0] || { total: 0, naoLidas: 0, urgentes: 0, acaoRequerida: 0 },
      recentAlerts
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Gerar alertas automaticamente
export const generateAlerts = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    const results = await generateAllAlerts(tenantId);
    
    res.json({
      message: 'Alertas gerados com sucesso',
      ...results
    });
  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};