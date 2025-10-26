// src/hooks/useAuth.ts

import React, { useState, useEffect, useCallback } from 'react';

// Endereço do json-server
const API_URL = 'http://localhost:3001'; 

interface User {
 id: number; // Mudar para number, pois json-server usa number por padrão
 email: string;
 name: string;
 role: string;
}

// Interface para os dados que virão no login
interface Credentials {
    email: string;
    password?: string;
}

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Efeito para carregar sessão do localStorage (mantemos para persistir o user logado)
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
            try {
                const userData: User = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('user'); // Limpa se o JSON estiver corrompido
            }
        }
        setLoading(false);
    }, []);


    // 2. Função de LOGIN (Simula a chamada de API e validação)
    const signIn = useCallback(async (credentials: Credentials): Promise<User> => {
        setLoading(true);
        
        try {
            // Usa o json-server para encontrar o usuário com o email e senha
            // Nota: Em um backend real, NUNCA faríamos o filtro de senha no frontend
            const response = await fetch(`${API_URL}/users?email=${credentials.email}&password=${credentials.password}`);
            
            if (!response.ok) {
                throw new Error('Falha na comunicação com o servidor.');
            }
            
            const usersFound: User[] = await response.json();
            
            if (usersFound && usersFound.length === 1) {
                const userData = usersFound[0];
                
                // Sucesso: Salva no estado e no storage
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData));
                
                return userData;
            } else {
                throw new Error('Email ou senha inválidos.');
            }
        } catch (error) {
            console.error("Erro no login:", error);
            setIsAuthenticated(false);
            throw error; // Propaga o erro para ser tratado pelo componente de Login (se existir)
        } finally {
            setLoading(false);
        }
    }, []);


    // 3. Função de LOGOUT (Limpa a sessão)
    const signOut = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        setLoading(false);
    }, []);

    return { 
        user, 
        isAuthenticated, 
        loading, 
        signIn, 
        signOut 
    };
}