import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

/**
 * Busca usuário completo por ID
 */
export const getUserFullById = async (userId) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw { status: 404, message: 'Usuário não encontrado' };
  }
  return user;
};

/**
 * Atualiza dados seguros do usuário
 */
export const updateUserProfile = async (userId, safeData) => {
  await User.findOneAndUpdate(
    { id: userId },
    { ...safeData, updatedAt: new Date() }
  );
};

/**
 * Altera senha do usuário
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw { status: 404, message: 'Usuário não encontrado' };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw { status: 401, message: 'Senha atual incorreta' };
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
};

/**
 * Lista usuários por tenant (admin)
 */
export const listUsersByTenant = async (tenantId) => {
  const users = await User.find({ tenantId });

  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    tenantId: u.tenantId,
    plan: u.plan,
    emailVerified: u.emailVerified,
  }));
};

/**
 * Atualiza imagem de perfil
 */
export const updateProfileImage = async (userId, file) => {
  if (!file) {
    throw { status: 400, message: 'Imagem não enviada' };
  }

  await User.findOneAndUpdate(
    { id: userId },
    {
      profileImage: {
        data: file.buffer,
        contentType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      },
    }
  );
};
