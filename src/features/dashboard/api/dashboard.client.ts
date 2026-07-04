import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

const BASE = '/api/v1/dashboard';

export const dashboardClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

dashboardClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

dashboardClient.interceptors.response.use(
  undefined,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error.response?.data ?? error);
  },
);
