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
const EXPRESS_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
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
    console.log('[FRONTEND AUTH] Carregando sessão do localStorage...');
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      
      console.log('[FRONTEND AUTH] Dados encontrados:', {
        token: savedToken ? 'Presente' : 'Ausente',
        user: savedUser ? 'Presente' : 'Ausente'
      });
      
      if (savedToken && savedUser) {
        const userData: User = JSON.parse(savedUser);
        console.log('[FRONTEND AUTH] Restaurando sessão para:', userData.email);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('[FRONTEND AUTH] Nenhuma sessão encontrada, limpando localStorage');
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (error) {
      console.error('[FRONTEND AUTH] Erro ao carregar sessão:', error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } finally {
      console.log('[FRONTEND AUTH] Carregamento de sessão concluído');
      setLoading(false);
    }
  }, []);

  // LOGIN (SignIn)
  const signIn = useCallback(async (credentials: Credentials): Promise<User> => {
    console.log('[FRONTEND AUTH] 🚀 Iniciando processo de login...');
    console.log('[FRONTEND AUTH] Credenciais:', { email: credentials.email, password: '***' });
    
    setLoading(true);
    try {
      // 1. Requisição de login
      const loginUrl = `${EXPRESS_SERVER_URL}/api/login`;
      console.log(`[FRONTEND AUTH] 📡 Fazendo requisição para: ${loginUrl}`);
      
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      console.log('[FRONTEND AUTH] 📥 Resposta recebida:', { 
        status: res.status, 
        ok: res.ok, 
        statusText: res.statusText 
      });

      const data = await res.json().catch((err) => {
        console.error('[FRONTEND AUTH] ❌ Erro ao parsear JSON:', err);
        return {};
      });
      
      console.log('[FRONTEND AUTH] 📄 Dados da resposta:', data);
      
      if (!res.ok) {
        console.error('[FRONTEND AUTH] ❌ Resposta não OK:', { status: res.status, data });
        const err: any = new Error(data?.message || 'Credenciais inválidas.');
        err.status = res.status;
        err.data = data;
        throw err;
      }

      const token: string = data.token;
      const userData: User = data.user;

      console.log('[FRONTEND AUTH] 🎫 Token recebido:', token ? 'SIM (length: ' + token.length + ')' : 'NÃO');
      console.log('[FRONTEND AUTH] 👤 Dados do usuário recebidos:', userData);

      if (!token) {
        throw new Error('Token não recebido do servidor');
      }

      if (!userData) {
        throw new Error('Dados do usuário não recebidos do servidor');
      }

      // 2. Persistir sessão e atualizar estado
      console.log('[FRONTEND AUTH] 💾 Salvando dados no localStorage...');
      console.log('[FRONTEND AUTH] Chaves usadas:', { tokenKey: AUTH_TOKEN_KEY, userKey: AUTH_USER_KEY });
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));

      // Verificar se foi salvo
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      console.log('[FRONTEND AUTH] ✅ Verificação localStorage:', {
        tokenSaved: savedToken ? 'SIM (length: ' + savedToken.length + ')' : 'NÃO',
        userSaved: savedUser ? 'SIM (length: ' + savedUser.length + ')' : 'NÃO',
        tokensMatch: savedToken === token
      });

      if (!savedToken || !savedUser) {
        throw new Error('Falha ao salvar dados no localStorage');
      }
      
      console.log('[FRONTEND AUTH] 🔄 Atualizando estado da aplicação...');
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('[FRONTEND AUTH] ✅ Estado atualizado:', {
        isAuthenticated: true,
        userId: userData.id,
        userEmail: userData.email
      });
      
      console.log('[FRONTEND AUTH] 🎉 LOGIN CONCLUÍDO COM SUCESSO!');
      
      // Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return userData;
    } catch (error) {
      console.error('[FRONTEND AUTH] ❌ ERRO NO LOGIN:', error);
      console.error('[FRONTEND AUTH] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      // Limpa qualquer resquício de sessão
      console.log('[FRONTEND AUTH] 🧹 Limpando localStorage devido ao erro...');
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      console.log('[FRONTEND AUTH] 🏁 Finalizando processo de login...');
      setLoading(false);
    }
  }, []); // navigate REMOVIDO das dependências

  // CADASTRO (não autentica)
  const signUp = useCallback(async (payload: SignUpPayload): Promise<any> => {
    setLoading(true);
    try {
      const res = await fetch(`${EXPRESS_SERVER_URL}/api/register`, {
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