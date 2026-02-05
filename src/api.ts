import axios, { AxiosError } from 'axios';
import { getToken, clearAuth } from './utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  console.log('[API INTERCEPTOR] 📤 Fazendo requisição:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    token: token ? `Presente (${token.substring(0, 20)}...)` : 'Ausente'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API INTERCEPTOR] ✅ Token adicionado ao header Authorization');
  } else {
    console.warn('[API INTERCEPTOR] ⚠️ Nenhum token encontrado - requisição sem autenticação');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[API INTERCEPTOR] 📥 Resposta recebida com sucesso:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method;
    
    console.error('[API INTERCEPTOR] ❌ Erro na resposta:', {
      url,
      method,
      status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data
    });
    
    // Só faz logout se for uma requisição autenticada que falhou
    if ((status === 401 || status === 403) && 
        !window.location.pathname.includes('/login') &&
        !url?.includes('/forgot-password') &&
        !url?.includes('/resend-verification') &&
        !url?.includes('/reset-password')) {
      
      console.error('[API INTERCEPTOR] 🚨 TOKEN INVÁLIDO/EXPIRADO - INICIANDO LOGOUT AUTOMÁTICO');
      console.error('[API INTERCEPTOR] Detalhes do erro de autenticação:', {
        status,
        url,
        method,
        currentPath: window.location.pathname,
        errorData: error.response?.data
      });
      
      clearAuth();
      console.log('[API INTERCEPTOR] 📢 Disparando evento de logout...');
      window.dispatchEvent(new Event('auth:logout'));
    } else {
      console.log('[API INTERCEPTOR] ℹ️ Erro não relacionado à autenticação ou em rota pública - não fazendo logout');
    }
    return Promise.reject(error);
  }
);

export default api;
