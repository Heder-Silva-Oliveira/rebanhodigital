import { Router } from 'express';
import * as notificationController from '../controller/notification.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de notificações
router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);

// Rotas especiais
router.post('/mark-multiple-read', notificationController.markMultipleAsRead);
router.get('/stats', notificationController.getNotificationStats);
router.post('/generate-alerts', notificationController.generateAlerts);

export default router;