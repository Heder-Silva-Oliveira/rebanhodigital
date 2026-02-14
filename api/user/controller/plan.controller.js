import { User } from '../../models/User.model.js';
import { Animal } from '../../models/Animal.model.js';
import { Pasture } from '../../models/Pasture.model.js';
import { Receita as Recipe } from '../../models/Recipe.model.js';
import { PLAN_LIMITS, canDowngrade } from '../../config/plans.js';

// Obter informações do plano atual
export const getCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const planInfo = PLAN_LIMITS[user.plan];
    
    // Buscar uso atual
    const [animalsCount, pasturesCount, recipesCount, usersCount] = await Promise.all([
      Animal.countDocuments({ tenantId: user.tenantId }),
      Pasture.countDocuments({ tenantId: user.tenantId }),
      Recipe.countDocuments({ tenantId: user.tenantId }),
      User.countDocuments({ tenantId: user.tenantId }),
    ]);
    
    res.json({
      currentPlan: user.plan,
      planInfo,
      usage: {
        animals: animalsCount,
        pastures: pasturesCount,
        recipes: recipesCount,
        users: usersCount,
      },
      limits: {
        animals: planInfo.animals,
        pastures: planInfo.pastures,
        recipes: planInfo.recipes,
        users: planInfo.users,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar informações do plano', error: error.message });
  }
};

// Listar todos os planos disponíveis
export const getAvailablePlans = (req, res) => {
  const plans = Object.keys(PLAN_LIMITS).map(key => ({
    id: key,
    ...PLAN_LIMITS[key]
  }));
  
  res.json({ plans });
};

// Fazer upgrade/downgrade de plano
export const changePlan = async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    if (!['basic', 'pro', 'enterprise'].includes(newPlan)) {
      return res.status(400).json({ message: 'Plano inválido' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (user.plan === newPlan) {
      return res.status(400).json({ message: 'Você já está neste plano' });
    }
    
    // Verificar se é downgrade
    const planOrder = { basic: 1, pro: 2, enterprise: 3 };
    const isDowngrade = planOrder[newPlan] < planOrder[user.plan];
    
    if (isDowngrade) {
      // Verificar uso atual
      const [animalsCount, pasturesCount, recipesCount, usersCount] = await Promise.all([
        Animal.countDocuments({ tenantId: user.tenantId }),
        Pasture.countDocuments({ tenantId: user.tenantId }),
        Recipe.countDocuments({ tenantId: user.tenantId }),
        User.countDocuments({ tenantId: user.tenantId }),
      ]);
      
      const currentUsage = {
        animals: animalsCount,
        pastures: pasturesCount,
        recipes: recipesCount,
        users: usersCount,
      };
      
      const downgradeCheck = canDowngrade(user.plan, newPlan, currentUsage);
      
      if (!downgradeCheck.canDowngrade) {
        return res.status(400).json({
          message: 'Não é possível fazer downgrade',
          warnings: downgradeCheck.warnings,
          currentUsage,
          newLimits: PLAN_LIMITS[newPlan],
        });
      }
    }
    
    // Atualizar plano
    user.plan = newPlan;
    await user.save();
    
    res.json({
      message: `Plano alterado para ${PLAN_LIMITS[newPlan].name} com sucesso!`,
      newPlan: newPlan,
      planInfo: PLAN_LIMITS[newPlan],
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao alterar plano', error: error.message });
  }
};
