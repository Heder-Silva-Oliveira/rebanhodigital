import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5000'
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Mount routes at /api
app.use('/api', routes);

export default app;