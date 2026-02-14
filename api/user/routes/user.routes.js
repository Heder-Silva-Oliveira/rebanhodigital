import express from 'express';
import * as userController from '../controller/user.controller.js';
import * as planController from '../controller/plan.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';
import { checkPlanFeature, checkPlanLimit } from '../../middlewares/plan.middleware.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authenticateToken); // Protege todas as rotas abaixo

// Rotas de usuários
router.get('/', checkRole(['admin']), userController.listUsers);
router.post('/', checkRole(['admin']), checkPlanFeature('multiUser'), checkPlanLimit('users'), userController.createUser);
router.get('/:id/full', userController.getFullProfile);
router.patch('/:id', userController.updateProfile);
router.patch('/:id/change-password', userController.changePassword);
router.put('/:userId', checkRole(['admin']), userController.updateUser);
router.delete('/:userId', checkRole(['admin']), userController.deleteUser);
router.get('/:id/profile-image', userController.getProfileImage);
router.patch('/:id/profile-image', uploadMiddleware.single('profileImage'), userController.uploadProfileImage);

// Rotas de planos
router.get('/plan/current', planController.getCurrentPlan);
router.get('/plan/available', planController.getAvailablePlans);
router.post('/plan/change', checkRole(['admin']), planController.changePlan);

export default router;