import { X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: string;
  upgradeTo: string;
}

const featureNames: Record<string, string> = {
  companyHealth: 'Saúde da Empresa',
  planning: 'Planejamento',
  advancedReports: 'Relatórios Avançados',
  dataExport: 'Exportação de Dados',
  whatsappNotifications: 'Notificações WhatsApp',
  multiUser: 'Múltiplos Usuários',
};

export default function UpgradeModal({ isOpen, onClose, feature, currentPlan, upgradeTo }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} className="text-yellow-600" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Recurso Bloqueado</h2>
          
          <p className="text-gray-600 mb-4">
            O recurso <strong>{featureNames[feature] || feature}</strong> não está disponível no plano{' '}
            <strong>{currentPlan}</strong>.
          </p>

          <p className="text-gray-600 mb-6">
            Faça upgrade para o plano <strong>{upgradeTo}</strong> para desbloquear este e outros recursos.
          </p>

          <div className="flex gap-2">
            <Link
              to="/planos"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Ver Planos
            </Link>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
