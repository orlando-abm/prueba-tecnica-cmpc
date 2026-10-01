import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string, remember: boolean) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: localStorage.getItem('auth-token') ?? sessionStorage.getItem('auth-token'),
  setToken: (token, remember) => {
    if (remember) {
      localStorage.setItem('auth-token', token);
    } else {
      sessionStorage.setItem('auth-token', token);
    }
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-token');
    set({ token: null });
  },
}));
