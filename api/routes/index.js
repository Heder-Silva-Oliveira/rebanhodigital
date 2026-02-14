import express from 'express';
import authRoutes from '../auth/routes/auth.routes.js';
import userRoutes from '../user/routes/user.routes.js';
import animalRoutes from '../animal/routes/animal.routes.js';
import pastureRoutes from '../pasture/routes/pasture.routes.js';
import financialRoutes from '../financial/routes/financial.routes.js';
import planningRoutes from '../planning/routes/planning.routes.js';
import weighingRoutes from '../weighing/routes/weighing.routes.js';
import companyHealthRoutes from '../company-health/routes/companyHealth.routes.js';
import recipeRoutes from '../recipe/routes/recipe.routes.js';
import notificationRoutes from '../notification/routes/notification.routes.js';

const router = express.Router();

// Public health check
router.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor AgroGest funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Auth routes first (specific routes like /login)
router.use('/', authRoutes); // /api/login, /api/register, etc
// User management routes (admin only)
router.use('/users', userRoutes);
router.use('/animals', animalRoutes);
router.use('/pastures', pastureRoutes);
router.use('/financial_transactions', financialRoutes);
router.use('/planning', planningRoutes);
router.use('/weighing_records', weighingRoutes);
router.use('/company-health', companyHealthRoutes);
router.use('/recipes', recipeRoutes);
router.use('/notifications', notificationRoutes);

export default router;