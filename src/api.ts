import axios from 'axios';

// Sua URL base do backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_URL,
});

// 1. Interceptor de REQUISIÇÃO (Injeta o Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de RESPOSTA (Trata Token Expirado)
api.interceptors.response.use(
  (response) => response, // Se for sucesso, não faz nada
  (error) => {
    // Se o erro for 401 ou 403, o token é inválido/expirou.
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Evita loop se o erro for na própria tela de login
      if (!window.location.pathname.includes('/login')) { 
        console.error("Token expirado ou inválido. Fazendo logout.");
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/'; // Redireciona para a Home (onde o modal de login está)
      }
    }
    return Promise.reject(error);
  }
);

export default api;