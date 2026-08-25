import { create } from 'zustand';
import api from '../services/api';

const DEFAULT_SEED_EMAIL = 'chandana.chandu.06.11@gmail.com';
const DEFAULT_SEED_PASS = 'password123';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? (localStorage.getItem('agentflow_token') || localStorage.getItem('token')) : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to log in. Please check your credentials.';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signup: async (name, email, password, role = 'operator') => {
    return get().register(name, email, password, role);
  },

  autoLoginSeedAccount: async () => {
    try {
      const loginRes = await get().login(DEFAULT_SEED_EMAIL, DEFAULT_SEED_PASS);
      if (loginRes.success) return true;
    } catch (e) {
      console.warn('Auto-login seed attempt error:', e.message);
    }
    return false;
  },

  fetchMe: async () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('agentflow_token') || localStorage.getItem('token')) : null;
    
    if (!token) {
      const autoSuccess = await get().autoLoginSeedAccount();
      if (!autoSuccess) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.warn('[AuthStore] Session invalid or server restarted. Auto-reauthenticating with seed user.');
      const autoSuccess = await get().autoLoginSeedAccount();
      if (!autoSuccess) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('agentflow_token');
          localStorage.removeItem('agentflow_user');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout request network errors
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }
}));
