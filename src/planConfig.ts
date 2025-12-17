// Esta é a "Fonte da Verdade" dos planos para o Frontend
export const PLAN_LIMITS_FRONTEND = {
  free: {
    name: "Basic",
    animals: 5,
    pastures: 2,
    features: {
      companyHealth: false
    }
  },
  pro: {
    name: "Pro",
    animals: 500,
    pastures: 50,
    features: {
      companyHealth: true
    }
  },
  enterprise: {
    name: "Enterprise",
    animals: Infinity,
    pastures: Infinity,
    features: {
      companyHealth: true
    }
  }
};