import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import animalRoutes from './animal.routes.js';
import pastureRoutes from './pasture.routes.js';
import financialRoutes from './financial.routes.js';
import planningRoutes from './planning.routes.js';
import weighingRoutes from './weighing.routes.js';
import companyHealthRoutes from './companyHealth.routes.js';

const router = express.Router();

// Public health check
router.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor AgroGest funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
router.use('/', authRoutes); // /api/login, /api/users (POST)
router.use('/users', userRoutes);
router.use('/animals', animalRoutes);
router.use('/pastures', pastureRoutes);
router.use('/financial_transactions', financialRoutes);
router.use('/planning', planningRoutes);
router.use('/weighing_records', weighingRoutes);
router.use('/company-health', companyHealthRoutes);

export default router;