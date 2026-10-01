import { http } from '@/lib/http';
import type { LoginDto } from '@repo/shared/schemas/auth.schema';

export interface LoginResponse {
  token: string;
}

export const authService = {
  login: (data: LoginDto) => http.post<LoginResponse>('/auth/login', data),
};
