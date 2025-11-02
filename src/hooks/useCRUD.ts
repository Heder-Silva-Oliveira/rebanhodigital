import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const handleAuthError = () => {
  console.error("Token expirado ou inválido. Fazendo logout.");
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Redireciona para a Home (onde o modal de login está)
  window.location.href = '/'; 
};

// NOVO: Função helper para pegar os cabeçalhos de autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
};

interface CRUDOptions {
  entityName: string
  sortBy?: Record<string, 1 | -1>
}

export function useCRUD<T extends { id?: string } = any>(options: CRUDOptions | string) {
  const entityName = typeof options === 'string' ? options : options.entityName
  const sortBy = typeof options === 'object' ? options.sortBy : undefined

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------------------------------------------------
  // 1. Lógica de Carregamento (READ)
  // -----------------------------------------------------------------------
  const loadData = useCallback(async () => {
    if (!entityName) {
      setError('Nome da entidade não fornecido')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/api/${entityName}`;
      console.log(`[useCRUD] Carregando dados de: ${url}`);

      try {
        const response = await fetch(url, { 
          headers: getAuthHeaders() // Usa a nova função
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            handleAuthError();
            return; // Interrompe a execução
          }
          throw new Error(`Falha ao buscar dados (Status: ${response.status})`);
        }
        
        const result = await response.json();
        
        let finalData: T[] = [];
        if (Array.isArray(result)) {
            finalData = result as T[];
        } else if (result.animals) { // Caso específico do seu server.js
            finalData = result.animals as T[];
        } else if (result && typeof result === 'object' && result[entityName]) {
            finalData = result[entityName] as T[];
        } else {
             console.warn(`[useCRUD] Formato de resposta inesperado:`, result);
             finalData = [];
        }
        
        // --- APLICAR SORTBY ---
        if (sortBy && finalData.length > 0) {
          const sortKey = Object.keys(sortBy)[0]
          const sortOrder = sortBy[sortKey]
          finalData = [...finalData].sort((a, b) => {
            const aVal = a[sortKey as keyof T]
            const bVal = b[sortKey as keyof T]
            // Lógica de sort simples (pode precisar de ajuste para datas/números)
            if (aVal > bVal) return sortOrder;
            if (aVal < bVal) return -sortOrder;
            return 0;
          })
        }

        console.log(`[useCRUD] Dados carregados:`, finalData.length, 'itens');
        setData(finalData);

      } catch (err) {
        console.error(`Erro ao buscar dados da API ${url}:`, err);
        setError(`Falha ao carregar dados de ${entityName}.`);
        setData([]);
      }

    } catch (err) {
      console.error(`Erro inesperado em loadData:`, err)
      setError(`Erro inesperado ao carregar ${entityName}`)
    } finally {
      setLoading(false);
    }
  }, [entityName, sortBy]); // ✅ REMOVI sortBy das dependências

  // ✅ CORREÇÃO: useEffect com array de dependências VAZIO
  useEffect(() => {
    loadData();
  }, []); // ✅ MUDEI: [] em vez de [loadData]

  // -----------------------------------------------------------------------
  // 2. Lógica de Criação (CREATE)
  // -----------------------------------------------------------------------
  const createRecord = useCallback(async (item: Omit<T, 'id'>) => {
    try {
      setError(null);
      const url = `${API_URL}/api/${entityName}`;
      
      // ALTERADO: Adiciona headers ao fetch
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(), // Usa a nova função
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return; 
        }
        const errorText = await response.text();
        throw new Error(`Falha na criação (Status: ${response.status}): ${errorText}`);
      }

      const newItem = await response.json() as T;
      setData(prev => [newItem, ...prev]);
      return newItem;
      
    } catch (err) {
      console.error(`Erro ao criar ${entityName}:`, err);
      setError(`Erro ao criar ${entityName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      throw err;
    }
  }, [entityName]);

  // -----------------------------------------------------------------------
  // 3. Lógica de Atualização (UPDATE)
  // -----------------------------------------------------------------------
  const updateRecord = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      setError(null);
      const url = `${API_URL}/api/${entityName}/${id}`;
      
      // ALTERADO: Adiciona headers ao fetch
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(), // Usa a nova função
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return; 
        }
        const errorText = await response.text();
        throw new Error(`Falha na atualização (Status: ${response.status}): ${errorText}`);
      }

      const updatedItem = await response.json() as T;
      setData(prev => prev.map(item => (item as any).id === id ? updatedItem : item));
      return updatedItem;
      
    } catch (err) {
      console.error(`Erro ao atualizar ${entityName}:`, err);
      setError(`Erro ao atualizar ${entityName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      throw err;
    }
  }, [entityName]);

  // -----------------------------------------------------------------------
  // 4. Lógica de Exclusão (DELETE)
  // -----------------------------------------------------------------------
  const deleteRecord = useCallback(async (id: string) => {
    try {
      setError(null);
      const url = `${API_URL}/api/${entityName}/${id}`;
      
      // ALTERADO: Adiciona headers ao fetch
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders() // Usa a nova função
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return; 
        }
        const errorText = await response.text();
        throw new Error(`Falha na exclusão (Status: ${response.status}): ${errorText}`);
      }

      setData(prev => prev.filter(item => (item as any).id !== id));
      
    } catch (err) {
      console.error(`Erro ao remover ${entityName}:`, err);
      setError(`Erro ao remover ${entityName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      throw err;
    }
  }, [entityName]);

  // -----------------------------------------------------------------------
  // 5. Efeito para Carregamento Inicial
  // -----------------------------------------------------------------------
  useEffect(() => {
    loadData()
  }, [loadData])

  // -----------------------------------------------------------------------
  // 6. Retorno do Hook
  // -----------------------------------------------------------------------
  return {
    data,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    reload: loadData
  }
}