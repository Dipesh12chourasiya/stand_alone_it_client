import axios from 'axios';
import { API_BASE_URL } from '@/config';

const BASE = `${API_BASE_URL}/api/v1/candidate`;

export const candidateClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// No auth interceptor — candidate routes are public via token
candidateClient.interceptors.response.use(
  undefined,
  (error) => Promise.reject(error.response?.data ?? error),
);
