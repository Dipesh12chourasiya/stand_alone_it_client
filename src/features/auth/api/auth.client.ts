import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

// ─── Base instance ───────────────────────────────────────────

const AUTH_BASE = '/api/v1/auth';

export const authClient = axios.create({
  baseURL: AUTH_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor — attach JWT ────────────────────────

authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response interceptor — unwrap data, handle 401 ──────────

authClient.interceptors.response.use(
  undefined,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Forward structured error so mutation handlers can read error.message
    return Promise.reject(error.response?.data ?? error);
  },
);
