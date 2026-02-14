import { useAuth } from '../hooks/useAuth';

export default function TestAuth() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
        
        <div className="space-y-2">
          <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}</p>
          
          {user ? (
            <>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Plano:</strong> {user.plan}</p>
              <p><strong>TenantId:</strong> {user.tenantId}</p>
              
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p className="font-semibold mb-2">É Admin?</p>
                <p className={`text-lg ${user.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.role === 'admin' ? '✅ SIM - Pode ver menu Usuários' : '❌ NÃO - Não pode ver menu Usuários'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-red-600">Nenhum usuário logado</p>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">LocalStorage:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify({
              token: localStorage.getItem('token') ? 'Presente' : 'Ausente',
              user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : 'Ausente'
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
