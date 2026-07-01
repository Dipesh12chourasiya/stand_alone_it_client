import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

// ─── Base instance ───────────────────────────────────────────

const BASE = '/api/v1/interviews';

export const interviewClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor — attach JWT ────────────────────────

interviewClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response interceptor — unwrap data, handle 401 ──────────

interviewClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error.response?.data ?? error);
  },
);
