import { authClient } from './auth.client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    authClient.post<ApiResponse<AuthResponse>>('/login', data),

  register: (data: RegisterRequest) =>
    authClient.post<ApiResponse<AuthResponse>>('/register', data),

  getMe: () =>
    authClient.get<ApiResponse<{ recruiter: User }>>('/me'),

  logout: () =>
    authClient.post<ApiResponse<null>>('/logout'),
};
