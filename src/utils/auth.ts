// src/utils/auth.ts

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getUser = () => {
  const user = localStorage.getItem('authUser');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (token: string, user: any) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};
