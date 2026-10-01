import type { ApiResponse } from '@repo/shared/types/response.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('auth-token') ?? sessionStorage.getItem('auth-token');
}

export class ApiError extends Error {
  status: number;
  error: { code: string; message: string };

  constructor(status: number, error: { code: string; message: string }) {
    super(error.message);
    this.status = status;
    this.error = error;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  const body: ApiResponse<T> = await res.json();

  if (!res.ok || !body.success)
    throw new ApiError(
      res.status,
      (body as { success: false; error: { code: string; message: string } }).error,
    );

  return body.data;
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
};
