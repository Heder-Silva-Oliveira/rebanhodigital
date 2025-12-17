import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import toast from 'react-hot-toast';
// ❌ REMOVIDO: import { useNavigate } from 'react-router-dom'; 

// --- Configuração e Variáveis ---
const EXPRESS_SERVER_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'user';

// --- Interfaces ---

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  plan: 'basic' | 'pro' | 'enterprise';
  hasProfileImage: boolean;
  phone: string;
}

interface Credentials {
  email: string;
  password: string;
}

type BillingCycle = 'monthly' | 'annual';
type PlanId = 'basic' | 'pro' | 'enterprise';

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: 'operador' | 'admin';
  plan: PlanId; // slugs aceitos pelo backend
  billingCycle: BillingCycle;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (credentials: Credentials) => Promise<User>;
  signUp: (payload: SignUpPayload) => Promise<any>; // não faz login
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Auth Provider ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ❌ REMOVIDO: const navigate = useNavigate(); 

  // Carregar sessão do localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedToken && savedUser) {
        const userData: User = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // LOGIN (SignIn)
  const signIn = useCallback(async (credentials: Credentials): Promise<User> => {
    setLoading(true);
    try {
      // 1. Requisição de login
      const res = await fetch(`${EXPRESS_SERVER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err: any = new Error(data?.message || 'Credenciais inválidas.');
        err.status = res.status;
        err.data = data;
        throw err;
      }

      const token: string = data.token;
      const userData: User = data.user;

      // 2. Persistir sessão e atualizar estado
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      // ❌ REMOVIDO: navigate('/dashboard'); - A navegação agora é feita pelo AuthModal
      
      return userData;
    } catch (error) {
      // Limpa qualquer resquício de sessão
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // navigate REMOVIDO das dependências

  // CADASTRO (não autentica)
  const signUp = useCallback(async (payload: SignUpPayload): Promise<any> => {
    setLoading(true);
    try {
      const res = await fetch(`${EXPRESS_SERVER_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err: any = new Error(data?.message || 'Erro ao cadastrar usuário.');
        err.status = res.status;
        err.data = data;
        throw err;
      }

      // Importante: NÃO fazer login aqui.
      // O fluxo espera verificação de email antes do login.
      return data; // opcionalmente retorna { message, ... }
    } finally {
      setLoading(false);
    }
  }, []);

  // LOGOUT
  const signOut = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    // ❌ REMOVIDO: navigate('/'); - A navegação agora é feita pelo componente que chama signOut (Navbar)
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
};