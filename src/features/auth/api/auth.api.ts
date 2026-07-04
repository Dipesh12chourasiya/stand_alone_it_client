import { authClient } from './auth.client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const { data: responseData } = await authClient.post<ApiResponse<AuthResponse>>('/login', data);
    return responseData;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const { data: responseData } = await authClient.post<ApiResponse<AuthResponse>>('/register', data);
    return responseData;
  },

  getMe: async (): Promise<ApiResponse<{ recruiter: User }>> => {
    const { data } = await authClient.get<ApiResponse<{ recruiter: User }>>('/me');
    return data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await authClient.post<ApiResponse<null>>('/logout');
    return data;
  },
};
