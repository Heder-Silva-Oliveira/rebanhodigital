import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { verifyAccessToken } from '../config/jwt.js';

export const authenticateToken = (req, res, next) => {
  console.log(`[AUTH MIDDLEWARE] ${req.method} ${req.path}`);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  console.log(`[AUTH MIDDLEWARE] Authorization header: ${authHeader ? 'Present' : 'Missing'}`);
  console.log(`[AUTH MIDDLEWARE] Token: ${token ? 'Present' : 'Missing'}`);

  if (!token) {
    console.log('[AUTH MIDDLEWARE] ❌ Token não fornecido');
    return res.status(401).json({ 
      error: 'Token não fornecido',
      code: 'NO_TOKEN' 
    });
  }

  try {
    const userPayload = verifyAccessToken(token);
    req.user = userPayload;
    
    console.log(`[AUTH MIDDLEWARE] ✅ Token válido para usuário: ${userPayload.userId}`);
    console.log(`[AUTH] ${new Date().toISOString()} - User ${userPayload.userId} accessed ${req.method} ${req.path}`);
    
    next();
  } catch (err) {
    let errorMessage = 'Token inválido';
    let errorCode = 'INVALID_TOKEN';
    
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
      errorCode = 'TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Token malformado';
      errorCode = 'MALFORMED_TOKEN';
    }
    
    console.log(`[AUTH MIDDLEWARE] ❌ ${errorMessage}: ${err.message}`);
    console.warn(`[AUTH] ${new Date().toISOString()} - Unauthorized access attempt from IP ${req.ip} - ${errorMessage}`);
    
    return res.status(403).json({ 
      error: errorMessage,
      code: errorCode
    });
  }
};

// Middleware opcional para verificar se o token está próximo do vencimento
export const checkTokenExpiry = (req, res, next) => {
  if (req.user && req.user.exp) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = req.user.exp - now;
    
    // Se o token expira em menos de 5 minutos, adiciona header de aviso
    if (timeUntilExpiry < 300) {
      res.set('X-Token-Expiry-Warning', 'true');
    }
  }
  
  next();
};