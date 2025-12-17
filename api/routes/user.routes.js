import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authenticateToken); // Protege todas as rotas abaixo

router.get('/', checkRole(['admin']), userController.listUsers);
router.get('/:id/full', userController.getFullProfile);
router.patch('/:id', userController.updateProfile);
router.patch('/:id/change-password', userController.changePassword);
router.get('/:id/profile-image', userController.getProfileImage);
router.patch('/:id/profile-image', uploadMiddleware.single('profileImage'), userController.uploadProfileImage);

export default router;