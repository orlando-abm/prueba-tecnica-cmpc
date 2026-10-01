import { http } from '@/lib/http';
import { ENDPOINTS } from '@repo/shared/constants/endpoints';
import type { ChangePasswordDto } from '@repo/shared/schemas/auth.schema';

export interface UserMe {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    name: string;
    lastname: string;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
}

export const usersService = {
  getMe: () => http.get<UserMe>(ENDPOINTS.users.me),
  changePassword: (dto: ChangePasswordDto) =>
    http.patch<void>(ENDPOINTS.users.changePassword, dto),
};
