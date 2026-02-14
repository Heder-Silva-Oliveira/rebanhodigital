import express from 'express';
import * as controladorDeReceitas from '../controller/recipe.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { checkPlanLimit } from '../../middlewares/plan.middleware.js';

const roteador = express.Router();

// Todas as operações exigem token válido
roteador.use(authenticateToken);

roteador.get('/', controladorDeReceitas.listarReceitas);
roteador.post('/', checkPlanLimit('recipes'), controladorDeReceitas.criarReceita);
roteador.patch('/:id', controladorDeReceitas.atualizarReceita);

export default roteador;