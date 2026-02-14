import express from 'express';
import * as animalController from '../controller/animal.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/role.middleware.js';
import { checkPlanLimit } from '../../middlewares/plan.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', animalController.list);
router.get('/:id', animalController.getById);
router.post('/', checkPlanLimit('animals'), animalController.create);
router.patch('/:id', animalController.update);
router.delete('/:id', checkRole(['admin']), animalController.remove);

export default router;