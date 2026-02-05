import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../user/model/User.model.js';
import { JWT_SECRET } from '../config/env.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js'; 

export const registerUser = async (userData) => {
  // Agora desestruturamos 'phone' também
  const { name, email: rawEmail, password, role: rawRole, plan: rawPlan, phone } = userData;
  
  const email = String(rawEmail).trim().toLowerCase();
  
  const exists = await User.findOne({ email });
  if (exists) {
    const error = new Error('Email já cadastrado.');
    error.status = 409;
    throw error;
  }

  const allowedRoles = ['operador', 'admin'];
  const role = allowedRoles.includes(rawRole) ? rawRole : 'operador';
  
  const allowedPlans = ['basic', 'pro', 'enterprise'];
  const plan = allowedPlans.includes(rawPlan) ? rawPlan : 'basic';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const newId = `user_${Date.now()}`;
  const emailToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    id: newId,
    tenantId: newId,
    email,
    password: hashedPassword,
    name,   // Frontend já mandará "Nome Sobrenome" concatenado aqui
    phone,  // ✅ Salvando o telefone
    role,
    plan,
    emailVerified: false,
    emailToken,
    emailTokenExpires: new Date(Date.now() + 3600000), 
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await sendVerificationEmail(user.email, emailToken);
  
  return user;
};

export const loginUser = async (emailRaw, password) => {
  const email = String(emailRaw).trim().toLowerCase();
  
  console.log(`[LOGIN SERVICE] Tentativa: ${email}`);

  const user = await User.findOne({ email });
  
  if (!user) {
    const err = new Error('Email ou senha inválidos.');
    err.status = 401;
    throw err;
  }

  if (!user.emailVerified) {
    const err = new Error('Email não verificado.');
    err.status = 403;
    err.requiresVerification = true;
    throw err;
  }

  const storedHash = user.password || '';
  const isPasswordMatch = await bcrypt.compare(password, storedHash);

  if (!isPasswordMatch) {
    const err = new Error('Email ou senha inválidos.');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
      plan: user.plan,
    },
    JWT_SECRET,
    { 
      expiresIn: '1h',
      issuer: 'agrogest-api',
      audience: 'agrogest-client'
    }
  );

  user.lastLogin = new Date();
  await user.save();

  return { 
    token, 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      plan: user.plan,
      hasProfileImage: !!user.profileImage?.data,
      phone: user.phone // ✅ Retorna o telefone no login
    }
  };
};


// ✅ NOVA FUNÇÃO: Gera token de redefinição e envia e-mail
export const generatePasswordResetToken = async (emailRaw) => {
    const email = String(emailRaw).trim().toLowerCase();
    
    const user = await User.findOne({ email });
    if (!user) {
        // Por segurança, não indicamos se o usuário existe, mas retornamos sucesso simulado
        console.warn(`Tentativa de redefinição para e-mail não encontrado: ${email}`);
        return { success: true }; 
    }

    // 1. Gera token único
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 900000); // 15 minutos

    // 2. Salva o token no DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // 3. Envia o e-mail (que contém o link para o frontend)
    await sendPasswordResetEmail(user.email, resetToken);

    return { success: true };
};

// ✅ NOVA FUNÇÃO: Redefine a senha (a ser chamada por um novo endpoint POST /api/reset-password)
export const resetPassword = async (token, newPassword) => {
    // 1. Procura o usuário pelo token e checa a validade
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        const error = new Error('Token inválido ou expirado.');
        error.status = 400;
        throw error;
    }

    // 2. Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Atualiza senha e limpa tokens
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true };
};