import { api } from './api';
import * as mockData from './mockData';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId?: string | number;
  staffId?: string | number;
  permissions: string[];
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';

export const authAPI = {
  login: (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      // Mock login - accept any email/password
      return Promise.resolve({
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: { ...mockData.mockAuthUser, email },
        },
      });
    }
    return api.post('/api/salon-dashboard/auth/login', {
      username: email,
      email,
      password,
    }).then((response) => {
      const data = response.data || {};
      const sessionUser = data.session?.user || {};
      const user = data.user || {};

      return {
        ...response,
        data: {
          ...data,
          token: data.token || data.accessToken,
          user: {
            id: String(user.id || sessionUser.staffPk || ''),
            email: user.email || sessionUser.email || email,
            name: user.name || sessionUser.staffName || '',
            role: user.role || sessionUser.roleName || 'Admin',
            roleId: user.roleId || sessionUser.role,
            staffId: user.staffId || sessionUser.staffId,
            permissions: user.permissions || data.session?.permissions || [],
          },
        },
      };
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getCurrentUser: (): AuthUser | null => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};
