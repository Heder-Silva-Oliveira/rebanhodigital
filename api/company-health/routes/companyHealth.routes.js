import express from 'express';
import * as companyHealthController from '../controller/companyHealth.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { checkPlanFeature } from '../../middlewares/plan.middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', checkPlanFeature('companyHealth'), companyHealthController.getCompanyHealth);

export default router;