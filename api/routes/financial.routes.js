import express from 'express';
import * as financialController from '../controllers/financial.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', financialController.list);
router.post('/', financialController.create);

export default router;