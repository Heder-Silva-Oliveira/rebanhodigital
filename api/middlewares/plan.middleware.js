import { PLAN_LIMITS } from '../config/plans.js';

export const checkPlanFeature = (featureName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.plan) {
      return res.status(401).json({ message: 'Plano não identificado.' });
    }
    
    const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.basic; 
    
    if (limits.features && limits.features[featureName]) {
      return next();
    }
    
    return res.status(403).json({
      message: `Recurso indisponível no plano ${limits.name}. Faça upgrade.`,
    });
  };
};