// ─── User ────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Requests ────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  company: string;
}

// ─── Responses ───────────────────────────────────────────────

export interface AuthResponse {
  recruiter: User;
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: string[];
}
