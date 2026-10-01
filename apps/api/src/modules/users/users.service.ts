import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { compare, hash } from 'bcryptjs';
import { UsersRepository } from './users.repository.js';
import type { ChangePasswordDto } from '@repo/shared/schemas/auth.schema';
import { AUTH_ERRORS } from '@/modules/auth/auth.errors.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly users: UsersRepository,
  ) {}

  async getMe(userId: string) {
    const user = await this.users.findByIdWithProfile(userId);
    if (!user) throw new UnauthorizedException(AUTH_ERRORS.UNAUTHORIZED);
    const { password: _, ...safe } = user;
    return safe;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    this.logger.info({ userId }, 'Cambio de contraseña');
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException(AUTH_ERRORS.UNAUTHORIZED);

    const valid = await compare(dto.currentPassword, user.password);
    if (!valid) {
      this.logger.warn({ userId }, 'Cambio fallido — contraseña actual incorrecta');
      throw new UnauthorizedException(AUTH_ERRORS.WRONG_PASSWORD);
    }

    const hashed = await hash(dto.newPassword, 10);
    await this.users.updatePassword(userId, hashed);
    this.logger.info({ userId }, 'Contraseña actualizada');
  }
}
