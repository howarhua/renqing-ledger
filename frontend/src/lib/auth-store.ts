/**
 * 认证状态管理
 */
import { create } from 'zustand';
import { authApi, TokenResponse } from './api';
import { useRemoteStore } from './remote-store';

interface User {
  id: string;
  username: string;
  phone?: string;
  created_at: string;
  last_login_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 操作
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (phone: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response: TokenResponse = await authApi.login({ username, password });
      localStorage.setItem('auth_token', response.access_token);
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      // 登录成功后加载远程数据
      await useRemoteStore.getState().load();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (username, password) => {
    set({ isLoading: true });
    try {
      await authApi.register({ username, password });
      // 注册后自动登录
      await useAuthStore.getState().login(username, password);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    // 登出时清空远程数据
    useRemoteStore.getState().clear();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
      // 检查成功后加载远程数据
      await useRemoteStore.getState().load();
    } catch {
      localStorage.removeItem('auth_token');
      useRemoteStore.getState().clear();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateProfile: async (phone: string) => {
    set({ isLoading: true });
    try {
      const user = await authApi.updateProfile({ phone });
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
