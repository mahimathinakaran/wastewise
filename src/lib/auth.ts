import { apiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthToken {
  token: string;
  user: User;
}

// Real authentication functions connected to FastAPI backend
export const login = async (email: string, password: string, role: 'user' | 'admin'): Promise<AuthToken> => {
  try {
    const response = await apiClient.login(email, password, role);
    console.log('Login response:', response);
    const auth = {
      token: response.token,
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      },
    };
    console.log('Parsed auth:', auth);
    return auth;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }
};

export const register = async (name: string, email: string, password: string, role: 'user' | 'admin'): Promise<AuthToken> => {
  try {
    const response = await apiClient.register(name, email, password, role);
    console.log('Register response:', response);
    const auth = {
      token: response.token,
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      },
    };
    console.log('Parsed auth:', auth);
    return auth;
  } catch (error: any) {
    console.error('Register error:', error);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

export const getStoredAuth = (): AuthToken | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  
  if (token && userStr) {
    return {
      token,
      user: JSON.parse(userStr),
    };
  }
  
  return null;
};

export const storeAuth = (auth: AuthToken): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('auth_token', auth.token);
  localStorage.setItem('auth_user', JSON.stringify(auth.user));
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};