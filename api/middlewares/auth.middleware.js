import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.user = userPayload;
    next();
  });
};