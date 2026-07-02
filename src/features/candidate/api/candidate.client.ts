import axios from 'axios';

const BASE = '/api/v1/candidate';

export const candidateClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// No auth interceptor — candidate routes are public via token
candidateClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data ?? error),
);
