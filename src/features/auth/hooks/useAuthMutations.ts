import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  AuthResponse,
  ApiError,
} from '../types/auth.types';

// ─── Login ───────────────────────────────────────────────────

export function useLoginMutation() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: (response: ApiResponse<AuthResponse>) => {
      const { recruiter, accessToken } = response.data;
      login(accessToken, recruiter);
      toast.success(response.message || 'Welcome back!');
      navigate('/dashboard', { replace: true });
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Invalid email or password.');
    },
  });
}

// ─── Register ────────────────────────────────────────────────

export function useRegisterMutation() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),

    onSuccess: (response: ApiResponse<AuthResponse>) => {
      const { recruiter, accessToken } = response.data;
      login(accessToken, recruiter);
      toast.success(response.message || 'Account created successfully.');
      navigate('/dashboard', { replace: true });
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || 'Registration failed. Please try again.');
    },
  });
}
