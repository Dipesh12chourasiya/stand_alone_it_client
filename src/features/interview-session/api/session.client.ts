import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

const BASE = '/api/v1/phone';

export const sessionClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT for recruiter-authenticated requests
sessionClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 for authenticated routes
sessionClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error.response?.data ?? error);
  },
);
