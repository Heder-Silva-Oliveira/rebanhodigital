import React, { 
    useState, 
    useEffect, 
    useCallback, 
    createContext, 
    useContext, 
    ReactNode 
} from 'react';

// A URL do seu backend
const EXPRESS_SERVER_URL = import.meta.env.VITE_API_URL; 

// --- 1. DEFINIÇÃO DOS TIPOS ---
interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    // Adicione o tenantId que o backend envia
    tenantId: string; 
}

interface Credentials {
    email: string;
    password?: string;
}

// O que o nosso contexto vai fornecer
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (credentials: Credentials) => Promise<User>;
    signUp: (credentials: any) => Promise<User>;
    signOut: () => void;
}

// --- 2. CRIAÇÃO DO CONTEXTO ---
// Este é o "molde" vazio
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. CRIAÇÃO DO PROVEDOR (O "CÉREBRO") ---
// Este componente vai envolver seu App e conter toda a lógica
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    // --- Toda a sua lógica do useAuth() vem para cá ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Começa true

    // 1. Efeito para carregar sessão do localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
            try {
                const userData: User = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Erro ao carregar usuário, limpando.");
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // 2. Função de LOGIN
    const signIn = useCallback(async (credentials: Credentials): Promise<User> => {
        setLoading(true);
        try {
            const response = await fetch(`${EXPRESS_SERVER_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credenciais inválidas.');
            }
            
            const data = await response.json();
            const userData: User = data.user; 
            const token = data.token;   

            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            
            return userData; 
        } catch (error: any) {
            localStorage.removeItem('user'); 
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            throw error; 
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Função de CADASTRO
    const signUp = useCallback(async (credentials: any): Promise<User> => {
        setLoading(true);
        try {
            const response = await fetch(`${EXPRESS_SERVER_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao cadastrar usuário.');
            }
            
            // Auto-login
            const loggedInUser = await signIn(credentials); 
            return loggedInUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [signIn]); // Dependência de signIn

    // 4. Função de LOGOUT
    const signOut = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setLoading(false);
        // O App.tsx vai re-renderizar e mostrar as PublicRoutes
    }, []);

    // --- Fim da sua lógica ---

    // O Provedor retorna o Contexto com os valores
    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated, 
            loading, 
            signIn, 
            signUp, 
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- 4. CRIAÇÃO DO HOOK (O "CONSUMIDOR") ---
// Este é o hook que seus componentes vão usar
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};