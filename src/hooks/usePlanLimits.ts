import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { PLAN_LIMITS_FRONTEND } from '../planConfig';
import { api } from '../api';

interface PlanUsage {
  animals: number;
  pastures: number;
  recipes: number;
  users: number;
}

export const usePlanLimits = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const userPlan = user?.plan || 'basic';
  const planConfig = PLAN_LIMITS_FRONTEND[userPlan as keyof typeof PLAN_LIMITS_FRONTEND] || PLAN_LIMITS_FRONTEND.basic;

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await api.get('/users/plan/current');
      setUsage(response.data.usage);
    } catch (error) {
      console.error('Erro ao carregar uso do plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = (resource: 'animals' | 'pastures' | 'recipes' | 'users'): boolean => {
    if (!usage) return true;
    
    const limit = planConfig[resource];
    if (limit === Infinity) return true;
    
    return usage[resource] < limit;
  };

  const hasFeature = (feature: string): boolean => {
    return planConfig.features[feature as keyof typeof planConfig.features] === true;
  };

  const getUsagePercentage = (resource: 'animals' | 'pastures' | 'recipes' | 'users'): number => {
    if (!usage) return 0;
    
    const limit = planConfig[resource];
    if (limit === Infinity) return 0;
    
    return Math.round((usage[resource] / limit) * 100);
  };

  return {
    planConfig,
    usage,
    loading,
    canCreate,
    hasFeature,
    getUsagePercentage,
    refreshUsage: loadUsage,
  };
};
