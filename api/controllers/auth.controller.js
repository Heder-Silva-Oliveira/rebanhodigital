import * as authService from '../services/auth.service.js';
import { User } from '../models/User.model.js';
import { sendVerificationEmail } from '../services/email.service.js';
import crypto from 'crypto';
import { FRONTEND_URL } from '../config/env.js';

export const register = async (req, res) => {
  try {
    // Agora esperamos 'phone' também
    const { name, email, password, phone } = req.body;
    
    // Validação básica atualizada
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Todos os campos (Nome, Email, Senha, Telefone) são obrigatórios.' });
    }

    const user = await authService.registerUser(req.body);

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      message: 'Usuário criado. Verifique seu email para ativar a conta.',
    });
  } catch (error) {
    console.error('❌ Erro Registro:', error);
    res.status(error.status || 400).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`[LOGIN CONTROLLER] Tentativa de login para: ${email}`);
    
    if (!email || !password) {
        console.log('[LOGIN CONTROLLER] ❌ Email ou senha ausentes');
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const result = await authService.loginUser(email, password);
    
    console.log(`[LOGIN CONTROLLER] ✅ Login bem-sucedido para: ${email}`);
    console.log(`[LOGIN CONTROLLER] Token gerado: ${result.token ? 'Sim' : 'Não'}`);
    console.log(`[LOGIN CONTROLLER] Dados do usuário: ${JSON.stringify(result.user, null, 2)}`);
    
    res.status(200).json(result);
  } catch (error) {
    console.error(`[LOGIN CONTROLLER] ❌ Erro Login para ${req.body.email}:`, error.message);
    res.status(error.status || 500).json({ 
        message: error.message || 'Erro interno do servidor.',
        requiresVerification: error.requiresVerification || false
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
      return res.status(400).json({ message: 'Token ausente.' });
  }

  try {
    const user = await User.findOne({ 
      emailToken: token,
      emailTokenExpires: { $gt: new Date() } 
    });
    
    if (!user) {
        return res.redirect(`${FRONTEND_URL}/verify-fail?reason=invalid`);
    }

    user.emailVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    await user.save();

    return res.redirect(`${FRONTEND_URL}/login-success?verified=true`);

  } catch (error) {
    console.error('Erro na verificação:', error);
    return res.redirect(`${FRONTEND_URL}/verify-fail?reason=error`);
  }
};

export const resendVerification = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    
    if (!email) {
        return res.status(400).json({ message: 'Email obrigatório.' });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        if (user.emailVerified) return res.status(200).json({ message: 'Email já verificado.' });

        const newToken = crypto.randomBytes(32).toString('hex');
        user.emailToken = newToken;
        user.emailTokenExpires = new Date(Date.now() + 3600000); 
        await user.save();

        await sendVerificationEmail(user.email, newToken);
        
        res.json({ message: 'Email de verificação reenviado com sucesso.' });
    } catch (error) {
        console.error('Erro ao reenviar:', error);
        res.status(500).json({ message: 'Erro interno ao processar solicitação.' });
    }
};
// ✅ NOVA FUNÇÃO: Forgot Password (Chamada pelo AuthModal)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

        // A lógica de segurança está no service, retornamos sucesso sempre
        await authService.generatePasswordResetToken(email); 

        // Retorno genérico de sucesso (para evitar enumeração de usuários)
        res.status(200).json({ message: 'Se o email estiver cadastrado, um link de redefinição foi enviado.' });
    } catch (error) {
        console.error('❌ Erro Forgot Password:', error);
        res.status(500).json({ message: 'Erro interno ao processar solicitação.' });
    }
};

// ✅ NOVA FUNÇÃO: Reset Password (Para a página /reset-password do frontend)
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
        if (newPassword.length < 8) return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres.' });

        await authService.resetPassword(token, newPassword);

        res.status(200).json({ message: 'Senha redefinida com sucesso! Você pode fazer login agora.' });
    } catch (error) {
        console.error('❌ Erro Reset Password:', error);
        res.status(error.status || 500).json({ message: error.message || 'Token inválido ou expirado.' });
    }
};