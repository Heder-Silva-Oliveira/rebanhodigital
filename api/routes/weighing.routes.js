import express from 'express';
import * as weighingController from '../controllers/weighing.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', weighingController.list);
router.post('/', weighingController.create);

export default router;