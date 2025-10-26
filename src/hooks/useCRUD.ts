import { useState, useEffect, useCallback } from 'react'

// Defina a URL base da API do json-server
const API_URL = 'http://localhost:3001';

interface CRUDOptions {
 entityName: string
 sortBy?: Record<string, 1 | -1>
}

// O tipo T agora deve ter 'id' como chave de identificação, e não '_id'.
// Omissão de 'id' ao criar um novo item.
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
     
     const url = `${API_URL}/${entityName}`;
     let finalData: T[] = [];

     try {
       const response = await fetch(url);
       if (!response.ok) {
         throw new Error(`Falha ao buscar dados (Status: ${response.status})`);
       }
       finalData = await response.json() as T[];
     } catch (err) {
       console.error(`Erro ao buscar dados da API ${url}:`, err);
       setError(`Falha ao carregar dados de ${entityName}. Verifique o json-server.`);
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
 // Recebe o item sem ID, o json-server irá criar.
 const createRecord = useCallback(async (item: Omit<T, 'id'>) => {
   if (!item || typeof item !== 'object') {
     throw new Error('Dados do item são inválidos')
   }

   try {
     setLoading(true);
     setError(null);

     const url = `${API_URL}/${entityName}`;
     
     // Prepara os dados, adicionando o timestamp inicial
     const itemToSend = { ...item, createdAt: new Date().toISOString() };

     const response = await fetch(url, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(itemToSend)
     });

     if (!response.ok) {
       throw new Error(`Falha na criação (Status: ${response.status})`);
     }

     const newItem = await response.json() as T;

     // Atualiza o estado local
     setData(prev => [newItem, ...prev]);

     return newItem;
     
   } catch (err) {
     console.error(`Erro ao criar ${entityName}:`, err);
     setError(`Erro ao criar ${entityName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
     throw err;
   } finally {
     setLoading(false);
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
     setLoading(true);
     setError(null);

     // A URL agora usa o 'id' que é o campo primário esperado pelo json-server.
     const url = `${API_URL}/${entityName}/${id}`;
     
     const response = await fetch(url, {
       method: 'PATCH', // Usamos PATCH para enviar apenas as modificações
       headers: { 'Content-Type': 'application/json' },
       // Adiciona o timestamp de atualização ao payload
       body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() })
     });

     if (!response.ok) {
       throw new Error(`Falha na atualização (Status: ${response.status})`);
     }

     const updatedItem = await response.json() as T;

     // Atualiza o estado local (em memória) para refletir a mudança
     // Usa 'id' para comparação no lugar de '_id'
     setData(prev => prev.map(item => (item as any).id === id ? updatedItem : item));

     return updatedItem;
     
   } catch (err) {
     console.error(`Erro ao atualizar ${entityName}:`, err);
     setError(`Erro ao atualizar ${entityName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
     throw err;
   } finally {
     setLoading(false);
   }
 }, [entityName, data]); // Adicionando 'data' como dependência para que o find de 'currentItem' funcione se necessário

 // -----------------------------------------------------------------------
 // 4. Lógica de Exclusão (DELETE)
 // -----------------------------------------------------------------------
 const deleteRecord = useCallback(async (id: string) => {
   if (!id || typeof id !== 'string') {
     throw new Error('ID inválido para remoção')
   }

   try {
     setLoading(true);
     setError(null);

     const url = `${API_URL}/${entityName}/${id}`;
     
     const response = await fetch(url, {
       method: 'DELETE'
     });

     if (!response.ok) {
       throw new Error(`Falha na exclusão (Status: ${response.status})`);
     }

     // Atualiza o estado local, removendo o item
     // Usa 'id' para comparação no lugar de '_id'
     setData(prev => prev.filter(item => (item as any).id !== id));
     
   } catch (err) {
     console.error(`Erro ao remover ${entityName}:`, err);
     setError(`Erro ao remover ${entityName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
     throw err;
   } finally {
     setLoading(false);
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