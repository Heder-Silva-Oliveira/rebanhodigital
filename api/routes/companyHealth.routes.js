import express from 'express';
import * as financialController from '../controllers/financial.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { checkPlanFeature } from '../middlewares/plan.middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', checkPlanFeature('companyHealth'), financialController.getCompanyHealth);

export default router;