import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { API_BASE_URL } from '@/config';

const BASE = `${API_BASE_URL}/api/v1/timeline`;

export const timelineClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT to every request
timelineClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
timelineClient.interceptors.response.use(
  undefined,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error.response?.data ?? error);
  },
);
