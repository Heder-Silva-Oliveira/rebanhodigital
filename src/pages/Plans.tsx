import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

interface PlanInfo {
  name: string;
  price: string;
  animals: number;
  pastures: number;
  weighings: number;
  recipes: number;
  users: number;
  features: Record<string, boolean>;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  animals: number;
  pastures: number;
  recipes: number;
  users: number;
  features: Record<string, boolean>;
}

export default function Plans() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const [currentRes, availableRes] = await Promise.all([
        api.get('/users/plan/current'),
        api.get('/users/plan/available'),
      ]);
      setCurrentPlan(currentRes.data);
      setAvailablePlans(availableRes.data.plans);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    if (!confirm(`Deseja alterar para o plano ${newPlan}?`)) return;

    try {
      await api.post('/users/plan/change', { newPlan });
      alert('Plano alterado com sucesso!');
      loadPlans();
    } catch (error: any) {
      if (error.response?.data?.warnings) {
        alert(
          'Não é possível fazer downgrade:\n\n' +
          error.response.data.warnings.join('\n')
        );
      } else {
        alert(error.response?.data?.message || 'Erro ao alterar plano');
      }
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  const featureLabels: Record<string, string> = {
    companyHealth: 'Saúde da Empresa',
    planning: 'Planejamento',
    advancedReports: 'Relatórios Avançados',
    dataExport: 'Exportação de Dados',
    whatsappNotifications: 'Notificações WhatsApp',
    smsNotifications: 'Notificações SMS',
    apiAccess: 'Acesso à API',
    customDashboard: 'Dashboard Personalizado',
    prioritySupport: 'Suporte Prioritário',
    aiInsights: 'Insights com IA',
    multiUser: 'Múltiplos Usuários',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Planos e Assinaturas</h1>

      {/* Plano Atual */}
      {currentPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Seu Plano Atual: {currentPlan.planInfo.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Animais</p>
              <p className="text-lg font-bold">
                {currentPlan.usage.animals} / {currentPlan.limits.animals === Infinity ? '∞' : currentPlan.limits.animals}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pastagens</p>
              <p className="text-lg font-bold">
                {currentPlan.usage.pastures} / {currentPlan.limits.pastures === Infinity ? '∞' : currentPlan.limits.pastures}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-lg font-bold">
                {currentPlan.usage.recipes} / {currentPlan.limits.recipes === Infinity ? '∞' : currentPlan.limits.recipes}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários</p>
              <p className="text-lg font-bold">
                {currentPlan.usage.users} / {currentPlan.limits.users === Infinity ? '∞' : currentPlan.limits.users}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planos Disponíveis */}
      <h2 className="text-xl font-bold mb-4">Planos Disponíveis</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 ${
              currentPlan?.currentPlan === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-2xl font-bold text-green-600 mb-4">{plan.price}</p>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-semibold">Animais:</span>{' '}
                {plan.animals === Infinity ? 'Ilimitados' : plan.animals}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Pastagens:</span>{' '}
                {plan.pastures === Infinity ? 'Ilimitadas' : plan.pastures}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Receitas:</span>{' '}
                {plan.recipes === Infinity ? 'Ilimitadas' : plan.recipes}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Usuários:</span>{' '}
                {plan.users === Infinity ? 'Ilimitados' : plan.users}
              </p>
            </div>

            <div className="border-t pt-4 mb-4">
              <p className="font-semibold mb-2 text-sm">Recursos:</p>
              <ul className="space-y-1">
                {Object.entries(plan.features).map(([key, value]) => (
                  <li key={key} className="text-sm flex items-center">
                    <span className={value ? 'text-green-600' : 'text-gray-400'}>
                      {value ? '✓' : '✗'}
                    </span>
                    <span className="ml-2">{featureLabels[key] || key}</span>
                  </li>
                ))}
              </ul>
            </div>

            {user?.role === 'admin' && currentPlan?.currentPlan !== plan.id && (
              <button
                onClick={() => handleChangePlan(plan.id)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Selecionar Plano
              </button>
            )}

            {currentPlan?.currentPlan === plan.id && (
              <div className="w-full bg-blue-600 text-white px-4 py-2 rounded text-center">
                Plano Atual
              </div>
            )}
          </div>
        ))}
      </div>

      {user?.role !== 'admin' && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Apenas administradores podem alterar o plano. Entre em contato com o administrador da conta.
          </p>
        </div>
      )}
    </div>
  );
}
