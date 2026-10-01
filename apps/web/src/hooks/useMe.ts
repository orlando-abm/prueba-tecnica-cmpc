import { useQuery, useMutation } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import type { ChangePasswordDto } from '@repo/shared/schemas/auth.schema';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => usersService.getMe(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => usersService.changePassword(dto),
  });
}
