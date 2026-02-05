import express from 'express';
import * as pastureController from '../controller/pasture.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', pastureController.list);
router.post('/', pastureController.create);
router.patch('/:id', pastureController.update);

export default router;