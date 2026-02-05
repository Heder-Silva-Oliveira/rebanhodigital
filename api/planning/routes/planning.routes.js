import express from 'express';
import * as planningController from '../controller/planning.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', planningController.list);
router.post('/', planningController.create);
router.patch('/:id', planningController.update);
router.delete('/:id', planningController.remove);
router.patch('/:id/complete', planningController.markAsCompleted);

export default router;