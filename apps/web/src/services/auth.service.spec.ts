import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import * as httpModule from '@/lib/http';

vi.mock('@/lib/http', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    error: { code: string; message: string };
    constructor(status: number, error: { code: string; message: string }) {
      super(error.message);
      this.status = status;
      this.error = error;
    }
  },
}));

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('login', () => {
    it('llama a http.post con las credenciales correctas', async () => {
      vi.mocked(httpModule.http.post).mockResolvedValue({ token: 'jwt-token' });
      const result = await authService.login({ email: 'test@mail.com', password: '123456' });
      expect(httpModule.http.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@mail.com',
        password: '123456',
      });
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('propaga el error si la llamada falla', async () => {
      vi.mocked(httpModule.http.post).mockRejectedValue(new Error('Network error'));
      await expect(authService.login({ email: 'x@mail.com', password: 'bad' })).rejects.toThrow(
        'Network error',
      );
    });
  });
});
