/**
 * Shared app configuration.
 *
 * In development, Vite's dev server proxies `/api` and `/socket.io` to the
 * backend, so the default (empty string) keeps all API URLs relative.
 *
 * In production, set VITE_API_BASE_URL to the deployed backend's origin.
 *
 *   VITE_API_BASE_URL=https://stand-alone-it-server.onrender.com
 *   VITE_SOCKET_URL=https://stand-alone-it-server.onrender.com
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';
