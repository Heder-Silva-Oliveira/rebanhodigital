import express from 'express';
import * as animalController from '../controllers/animal.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', animalController.list);
router.get('/:id', animalController.getById);
router.post('/', animalController.create);
router.patch('/:id', animalController.update);
router.delete('/:id', checkRole(['admin']), animalController.remove);

export default router;