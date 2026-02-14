import { PLAN_LIMITS } from '../config/plans.js';

export const checkPlanFeature = (featureName) => {
  return (req, res, next) => {
    console.log('[PLAN MIDDLEWARE] Verificando feature:', featureName);
    console.log('[PLAN MIDDLEWARE] Usuário:', req.user);
    
    if (!req.user || !req.user.plan) {
      console.log('[PLAN MIDDLEWARE] ❌ Plano não identificado');
      return res.status(401).json({ message: 'Plano não identificado.' });
    }
    
    const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.basic;
    console.log('[PLAN MIDDLEWARE] Limites do plano:', limits);
    console.log('[PLAN MIDDLEWARE] Features:', limits.features);
    console.log('[PLAN MIDDLEWARE] Feature solicitada:', featureName, '=', limits.features[featureName]);
    
    if (limits.features && limits.features[featureName]) {
      console.log('[PLAN MIDDLEWARE] ✅ Feature permitida');
      return next();
    }
    
    console.log('[PLAN MIDDLEWARE] ❌ Feature bloqueada');
    return res.status(403).json({
      message: `Recurso indisponível no plano ${limits.name}. Faça upgrade para acessar este recurso.`,
      feature: featureName,
      currentPlan: req.user.plan,
      upgradeTo: featureName === 'multiUser' ? 'pro' : 'pro',
    });
  };
};

// Middleware para verificar limites de quantidade
export const checkPlanLimit = (resourceType) => {
  return async (req, res, next) => {
    console.log('[PLAN LIMIT] Verificando limite para:', resourceType);
    console.log('[PLAN LIMIT] Usuário:', req.user);
    
    if (!req.user || !req.user.plan) {
      console.log('[PLAN LIMIT] ❌ Plano não identificado');
      return res.status(401).json({ message: 'Plano não identificado.' });
    }
    
    const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.basic;
    const limit = limits[resourceType];
    
    console.log('[PLAN LIMIT] Limite para', resourceType, ':', limit);
    
    if (limit === Infinity) {
      console.log('[PLAN LIMIT] ✅ Limite ilimitado');
      return next();
    }
    
    // Importar models dinamicamente para evitar dependência circular
    let Model;
    try {
      switch(resourceType) {
        case 'animals':
          Model = (await import('../models/Animal.model.js')).Animal;
          break;
        case 'pastures':
          Model = (await import('../models/Pasture.model.js')).Pasture;
          break;
        case 'recipes':
          Model = (await import('../models/Recipe.model.js')).Receita;
          break;
        case 'users':
          Model = (await import('../models/User.model.js')).User;
          break;
        default:
          console.log('[PLAN LIMIT] ⚠️ Tipo de recurso desconhecido:', resourceType);
          return next();
      }
      
      console.log('[PLAN LIMIT] Contando registros para tenantId:', req.user.tenantId);
      const count = await Model.countDocuments({ tenantId: req.user.tenantId });
      console.log('[PLAN LIMIT] Contagem atual:', count, '/ Limite:', limit);
      
      if (count >= limit) {
        console.log('[PLAN LIMIT] ❌ Limite atingido!');
        return res.status(403).json({
          message: `Limite de ${resourceType} atingido para o plano ${limits.name}.`,
          limit: limit,
          current: count,
          currentPlan: req.user.plan,
          upgradeTo: req.user.plan === 'basic' ? 'pro' : 'enterprise',
        });
      }
      
      console.log('[PLAN LIMIT] ✅ Dentro do limite, prosseguindo...');
      next();
    } catch (error) {
      console.error('[PLAN LIMIT] ❌ Erro ao verificar limite:', error);
      return res.status(500).json({ message: 'Erro ao verificar limite', error: error.message });
    }
  };
};