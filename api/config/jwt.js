import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET } from './env.js';

// Validação de secrets
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres');
}

/**
 * Gera access token JWT
 */
export const signAccessToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m', // Token de acesso curto
    issuer: 'agrogest-api',
    audience: 'agrogest-client',
    ...options,
  });
};

/**
 * Gera refresh token JWT
 */
export const signRefreshToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Refresh token mais longo
    issuer: 'agrogest-api',
    audience: 'agrogest-client',
    ...options,
  });
};

/**
 * Valida access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'agrogest-api',
    audience: 'agrogest-client'
  });
};

/**
 * Valida refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'agrogest-api',
    audience: 'agrogest-client'
  });
};

/**
 * Gera token seguro para reset de senha
 */
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Valida token (compatibilidade com código existente)
 */
export const verifyToken = verifyAccessToken;

/**
 * Gera token (compatibilidade com código existente)
 */
export const signToken = signAccessToken;