// src/utils/auth.ts

export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  console.log('[AUTH UTILS] 🎫 getToken chamado:', {
    tokenExists: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
  });
  return token;
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  console.log('[AUTH UTILS] 👤 getUser chamado:', {
    userExists: !!user,
    userLength: user?.length || 0
  });
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('[AUTH UTILS] ✅ Usuário parseado:', {
        id: parsedUser.id,
        email: parsedUser.email,
        name: parsedUser.name
      });
      return parsedUser;
    } catch (error) {
      console.error('[AUTH UTILS] ❌ Erro ao parsear usuário:', error);
      return null;
    }
  }
  
  return null;
};

export const setAuth = (token: string, user: any) => {
  console.log('[AUTH UTILS] 💾 setAuth chamado:', { 
    tokenProvided: !!token,
    tokenLength: token?.length || 0,
    userProvided: !!user,
    userEmail: user?.email || 'N/A'
  });
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Verificar se foi salvo
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('[AUTH UTILS] ✅ Dados salvos no localStorage:', {
      tokenSaved: !!savedToken,
      userSaved: !!savedUser,
      tokenMatches: savedToken === token
    });
  } catch (error) {
    console.error('[AUTH UTILS] ❌ Erro ao salvar no localStorage:', error);
  }
};

export const clearAuth = () => {
  console.log('[AUTH UTILS] 🧹 clearAuth chamado');
  console.log('[AUTH UTILS] Stack trace:', new Error().stack);
  
  const tokenBefore = localStorage.getItem('token');
  const userBefore = localStorage.getItem('user');
  
  console.log('[AUTH UTILS] Dados antes da limpeza:', {
    tokenExists: !!tokenBefore,
    userExists: !!userBefore
  });
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  const tokenAfter = localStorage.getItem('token');
  const userAfter = localStorage.getItem('user');
  
  console.log('[AUTH UTILS] ✅ Dados após limpeza:', {
    tokenExists: !!tokenAfter,
    userExists: !!userAfter,
    cleanupSuccessful: !tokenAfter && !userAfter
  });
};
