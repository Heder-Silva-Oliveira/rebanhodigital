// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';

// Defina a URL base do seu servidor Express/Backend real
const EXPRESS_SERVER_URL = import.meta.env.VITE_API_URL; 

interface User {
    id: string; // Alterado para string para consistência com Mongoose/Frontend
    email: string;
    name: string;
    role: string;
}

interface Credentials {
    email: string;
    password?: string;
}

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Efeito para carregar sessão do localStorage (Mantido para persistência)
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token'); // Verifica se o token também foi salvo

        if (savedUser && savedToken) {
            try {
                const userData: User = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Erro ao carregar usuário do localStorage, limpando.");
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);


    // 2. Função de LOGIN (Chama o novo endpoint /api/login)
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

            // Salva o Token e o Usuário no localStorage
            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            
            return userData; 
        } catch (error: any) {
            // Limpa localStorage em caso de falha
            localStorage.removeItem('user'); 
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            throw error; 
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Função de CADASTRO (Chama /api/users e faz login automático)
    const signUp = useCallback(async (credentials: any): Promise<User> => {
        setLoading(true);
        try {
            // 1. CHAMA O CADASTRO (POST /api/users)
            console.log("➡️ Enviando dados para cadastro:", credentials); // Linha de depuração
            const response = await fetch(`${EXPRESS_SERVER_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
            const errorData = await response.json();

            // ✅ LINHA NOVA: Para vermos o erro do Render no console
            console.error("❌ ERRO DO SERVIDOR (RENDER):", errorData); 

            // Tenta usar a mensagem 'details' que o backend envia
            throw new Error(errorData.details || errorData.message || 'Erro ao cadastrar usuário.');
        }
            
            
            // 2. AUTO-LOGIN: Chama signIn imediatamente para obter o token JWT e finalizar a sessão
            const loggedInUser = await signIn(credentials); 
            
            return loggedInUser;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [signIn]); // Dependência crucial: signIn

    // 4. Função de LOGOUT
    const signOut = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setLoading(false);
    }, []);

    return { 
        user, 
        isAuthenticated, 
        loading, 
        signIn, 
        signUp, // Exportando a nova função
        signOut 
    };
}