import express from 'express';
import * as planningController from '../controllers/planning.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', planningController.list);
router.post('/', planningController.create);

export default router;