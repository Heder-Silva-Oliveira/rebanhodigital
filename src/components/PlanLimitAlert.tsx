import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanLimitAlertProps {
  resource: string;
  current: number;
  limit: number;
  percentage: number;
}

export default function PlanLimitAlert({ resource, current, limit, percentage }: PlanLimitAlertProps) {
  if (percentage < 80) return null;

  const resourceNames: Record<string, string> = {
    animals: 'animais',
    pastures: 'pastagens',
    recipes: 'receitas',
    users: 'usuários',
  };

  const isAtLimit = percentage >= 100;
  const isNearLimit = percentage >= 80 && percentage < 100;

  return (
    <div className={`rounded-lg p-4 mb-4 ${
      isAtLimit ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-start">
        <AlertTriangle className={`mt-0.5 mr-3 ${
          isAtLimit ? 'text-red-600' : 'text-yellow-600'
        }`} size={20} />
        <div className="flex-1">
          <h3 className={`font-semibold ${
            isAtLimit ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {isAtLimit ? 'Limite Atingido' : 'Próximo do Limite'}
          </h3>
          <p className={`text-sm mt-1 ${
            isAtLimit ? 'text-red-700' : 'text-yellow-700'
          }`}>
            Você está usando {current} de {limit} {resourceNames[resource] || resource}.
            {isAtLimit && ' Não é possível adicionar mais itens.'}
          </p>
          <Link
            to="/planos"
            className={`text-sm font-semibold mt-2 inline-block ${
              isAtLimit ? 'text-red-600 hover:text-red-800' : 'text-yellow-600 hover:text-yellow-800'
            }`}
          >
            Fazer upgrade do plano →
          </Link>
        </div>
      </div>
    </div>
  );
}
