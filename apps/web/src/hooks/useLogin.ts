import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { LoginDto } from '@repo/shared/schemas/auth.schema';
import { ApiError } from '@/lib/http';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onError: (error) => {
      if (!(error instanceof ApiError)) console.error(error);
    },
  });
}
