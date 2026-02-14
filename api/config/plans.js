export const PLAN_LIMITS = {
  basic: {
    name: 'Básico',
    price: 'R$ 49,90/mês',
    animals: 50,
    pastures: 5,
    weighings: Infinity,
    recipes: 10,
    financialTransactions: 50, // por mês
    plannings: 0,
    users: 1,
    features: {
      companyHealth: false,
      planning: false,
      advancedReports: false,
      dataExport: false,
      whatsappNotifications: false,
      smsNotifications: false,
      apiAccess: false,
      customDashboard: false,
      multiUser: false,
    }
  },
  
  pro: {
    name: 'Profissional',
    price: 'R$ 149,90/mês',
    animals: 500,
    pastures: 50,
    weighings: Infinity,
    recipes: 100,
    financialTransactions: Infinity,
    plannings: 20,
    users: 5,
    features: {
      companyHealth: true,
      planning: true,
      advancedReports: true,
      dataExport: true,
      whatsappNotifications: true,
      smsNotifications: false,
      apiAccess: false,
      customDashboard: false,
      multiUser: true,
    }
  },
  
  enterprise: {
    name: 'Enterprise',
    price: 'Sob consulta',
    animals: Infinity,
    pastures: Infinity,
    weighings: Infinity,
    recipes: Infinity,
    financialTransactions: Infinity,
    plannings: Infinity,
    users: Infinity,
    features: {
      companyHealth: true,
      planning: true,
      advancedReports: true,
      dataExport: true,
      whatsappNotifications: true,
      smsNotifications: true,
      apiAccess: true,
      customDashboard: true,
      prioritySupport: true,
      aiInsights: true,
      multiUser: true,
    }
  }
};

// Helper para verificar se pode fazer downgrade
export const canDowngrade = (currentPlan, newPlan, currentUsage) => {
  const newLimits = PLAN_LIMITS[newPlan];
  const warnings = [];

  if (currentUsage.animals > newLimits.animals) {
    warnings.push(`Você possui ${currentUsage.animals} animais, mas o plano ${newLimits.name} permite apenas ${newLimits.animals}`);
  }
  
  if (currentUsage.pastures > newLimits.pastures) {
    warnings.push(`Você possui ${currentUsage.pastures} pastagens, mas o plano ${newLimits.name} permite apenas ${newLimits.pastures}`);
  }
  
  if (currentUsage.recipes > newLimits.recipes) {
    warnings.push(`Você possui ${currentUsage.recipes} receitas, mas o plano ${newLimits.name} permite apenas ${newLimits.recipes}`);
  }
  
  if (currentUsage.users > newLimits.users) {
    warnings.push(`Você possui ${currentUsage.users} usuários, mas o plano ${newLimits.name} permite apenas ${newLimits.users}`);
  }

  return { canDowngrade: warnings.length === 0, warnings };
};
