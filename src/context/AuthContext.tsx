import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface para os dados do usuário que você salva
interface User {
  id: string;
  name: string;
  email: string;
  role: 'adm' | 'operador'; // Use os roles do seu backend
  tenantId: string;
}

// Interface para o valor do Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Cria o Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o Provedor (Provider)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Estado de loading

  // Efeito para carregar o token do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao carregar autenticação", error);
    } finally {
      setLoading(false); // Termina o loading
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    // Força o redirecionamento para a página de login
    window.location.href = '/login'; 
  };

  // Não renderiza nada até que o token seja verificado
  if (loading) {
    return null; // Ou um spinner de tela cheia
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para consumir o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};