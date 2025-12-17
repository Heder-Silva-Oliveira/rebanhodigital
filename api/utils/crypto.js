import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash de senha
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compara senha com hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Gera token seguro (email, reset, etc)
 */
export const generateSecureToken = (size = 32) => {
  return crypto.randomBytes(size).toString('hex');
};
