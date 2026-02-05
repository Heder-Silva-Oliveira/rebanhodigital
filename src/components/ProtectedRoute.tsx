import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Corrigido o import

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('[PROTECTED ROUTE] Estado atual:', {
    isAuthenticated,
    loading,
    user: user ? user.email : 'Nenhum usuário'
  });

  if (loading) {
    console.log('[PROTECTED ROUTE] Carregando...');
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    console.log('[PROTECTED ROUTE] ❌ Usuário não autenticado, redirecionando para home');
    // Se não estiver autenticado, redireciona para a página inicial
    return <Navigate to="/" replace />;
  }

  console.log('[PROTECTED ROUTE] ✅ Usuário autenticado, renderizando conteúdo protegido');
  // Se estiver autenticado, renderiza a página filha (ex: Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;

export default ProtectedRoute;