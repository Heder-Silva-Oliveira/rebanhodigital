import { Router } from 'express';
// 1. Correção: Importa tudo como um objeto 'authController' (Namespace import)
import * as authController from '../controller/auth.controller.js';

const router = Router();

// 2. Rotas de Autenticação
router.post('/login', authController.login);

// 3. Correção: O frontend chama POST /api/users para criar conta
router.post('/users', authController.register);

// 4. Rotas de Verificação de Email (Necessárias para o fluxo funcionar)
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

router.post('/forgot-password', authController.forgotPassword); // 1. Enviar link por e-mail
router.post('/reset-password', authController.resetPassword);   // 2. Redefinir senha (requer token)
export default router;