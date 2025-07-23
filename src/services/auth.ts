import api from './api';
import { AuthResponse, LoginCredentials, Admin } from '../types';
import { STORAGE_KEYS, API_ENDPOINTS } from '../config/constants';

export const authService = {
  // Admin login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/admin/login', credentials);
    const { data } = response.data;
    
    // Store token and user data
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
    
    return data;
  },

  // Admin logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },

  // Get current admin profile
  getProfile: async (): Promise<Admin> => {
    const response = await api.get('/admin/profile');
    return response.data.data;
  },

  // Check if admin is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    return !!(token && user);
  },

  // Get current admin from localStorage
  getCurrentAdmin: (): Admin | null => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('admin_token');
  },

  // Refresh token (if needed)
  refreshToken: async (): Promise<string> => {
    const response = await api.post('/admin/refresh-token');
    const { token } = response.data.data;
    localStorage.setItem('admin_token', token);
    return token;
  },
};