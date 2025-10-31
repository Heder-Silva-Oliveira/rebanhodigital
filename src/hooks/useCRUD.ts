import { useState, useEffect, useCallback } from 'react'

// Defina a URL base da API do seu backend MongoDB
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface CRUDOptions {
  entityName: string
  sortBy?: Record<string, 1 | -1>
}

// O tipo T agora deve ter 'id' como chave de identificação
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
      
      const url = `${API_URL}/api/${entityName}`; // Note: /api/ prefix
      let finalData: T[] = [];

      console.log(`[useCRUD] Carregando dados de: ${url}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Falha ao buscar dados (Status: ${response.status})`);
        }
        
        const result = await response.json();
        console.log(`[useCRUD] Resposta da API:`, result);
        
        // --- LÓGICA DE DESEMPACOTAMENTO (CORRIGIDA) ---
        if (Array.isArray(result)) {
            // Caso 1: Resposta é um array limpo (JSON Server Style)
            finalData = result as T[];
        } else if (result && typeof result === 'object') {
            // Caso 2: Resposta é um objeto com a chave da entidade (Express/MongoDB Style)
            
            // Tenta a chave exata
            finalData = result[entityName] as T[]; 
            
            // Se a chave não funcionar, tenta o singular (e.g., 'animal' para 'animals')
            if (!Array.isArray(finalData) && result[entityName.slice(0, -1)]) {
                 finalData = result[entityName.slice(0, -1)] as T[];
            }

            if (!Array.isArray(finalData)) {
                console.warn(`[useCRUD] Formato de resposta inesperado/Não encontrado:`, result);
                finalData = [];
            }
        } else {
            console.warn(`[useCRUD] Formato de resposta inesperado:`, result);
            finalData = [];
        }
        
        // Adaptação para diferentes formatos de resposta
        if (result.animals) {
          // Se a resposta for { animals: [...] }
          finalData = result.animals as T[];
        } else if (Array.isArray(result)) {
          // Se a resposta for diretamente um array
          finalData = result as T[];
        } else {
          console.warn(`[useCRUD] Formato de resposta inesperado:`, result);
          finalData = [];
        }
        
      } catch (err) {
        console.error(`Erro ao buscar dados da API ${url}:`, err);
        setError(`Falha ao carregar dados de ${entityName}. Verifique se o servidor está rodando.`);
        finalData = [];
      }

      // --- 2. APLICAR SORTBY ---
      if (sortBy && finalData.length > 0) {
        const sortKey = Object.keys(sortBy)[0]
        const sortOrder = sortBy[sortKey]
        finalData = [...finalData].sort((a, b) => {
          const aVal = a[sortKey as keyof T]
          const bVal = b[sortKey as keyof T]
          return sortOrder === 1 ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
        })
      }

      console.log(`[useCRUD] Dados carregados:`, finalData.length, 'itens');
      setData(finalData);

    } catch (err) {
      console.error(`Erro inesperado em loadData:`, err)
      setError(`Erro inesperado ao carregar ${entityName}`)
    } finally {
      setLoading(false);
    }
  }, [entityName, sortBy]);

  // -----------------------------------------------------------------------
  // 2. Lógica de Criação (CREATE)
  // -----------------------------------------------------------------------
  const createRecord = useCallback(async (item: Omit<T, 'id'>) => {
    if (!item || typeof item !== 'object') {
      throw new Error('Dados do item são inválidos')
    }

    try {
      setError(null);

      const url = `${API_URL}/api/${entityName}`;
      
      console.log(`[useCRUD] Criando registro em: ${url}`, item);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha na criação (Status: ${response.status}): ${errorText}`);
      }

      const newItem = await response.json() as T;
      console.log(`[useCRUD] Registro criado:`, newItem);

      // Atualiza o estado local
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
    if (!id || typeof id !== 'string') {
      throw new Error('ID inválido para atualização')
    }

    try {
      setError(null);

      const url = `${API_URL}/api/${entityName}/${id}`;
      
      console.log(`[useCRUD] Atualizando registro: ${url}`, updates);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha na atualização (Status: ${response.status}): ${errorText}`);
      }

      const updatedItem = await response.json() as T;
      console.log(`[useCRUD] Registro atualizado:`, updatedItem);

      // Atualiza o estado local
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
    if (!id || typeof id !== 'string') {
      throw new Error('ID inválido para remoção')
    }

    try {
      setError(null);

      const url = `${API_URL}/api/${entityName}/${id}`;
      
      console.log(`[useCRUD] Deletando registro: ${url}`);

      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha na exclusão (Status: ${response.status}): ${errorText}`);
      }

      console.log(`[useCRUD] Registro ${id} deletado com sucesso`);

      // Atualiza o estado local, removendo o item
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