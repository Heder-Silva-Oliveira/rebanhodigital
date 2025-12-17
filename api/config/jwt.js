import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env.js';

/**
 * Gera token JWT
 */
export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    ...options,
  });
};

/**
 * Valida token JWT
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};