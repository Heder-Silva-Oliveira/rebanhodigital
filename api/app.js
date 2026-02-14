import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger } from './middlewares/logger.middleware.js';
// import { securityMiddleware, securityLogger } from './middlewares/security.middleware.js';
import routes from './routes/index.js';
import { NODE_ENV, FRONTEND_URL } from './config/env.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração CORS mais restritiva
const corsOptions = {
  origin: (origin, callback) => {
    // Lista de origens permitidas baseada no ambiente
    const allowedOrigins = NODE_ENV === 'production' 
      ? [FRONTEND_URL] // Apenas o domínio de produção
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000'
        ];

    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight por 24 horas
};

app.use(cors(corsOptions));

// Middlewares de segurança (devem vir antes das rotas)
// app.use(securityMiddleware);
// app.use(securityLogger);

app.use(express.json({ limit: '10mb' })); // Limite de payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Mount routes at /api
app.use('/api', routes);

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all handler: send back React's index.html file for any non-API routes
app.use((req, res, next) => {
  // Se não é uma rota da API, serve o index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    next();
  }
});

export default app;