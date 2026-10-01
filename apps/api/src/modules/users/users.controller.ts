import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { createZodDto } from 'nestjs-zod';
import { ChangePasswordSchema } from '@repo/shared/schemas/auth.schema';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy.js';
import { UsersService } from './users.service.js';

class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    @InjectPinoLogger(UsersController.name)
    private readonly logger: PinoLogger,
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload & { id: string }) {
    this.logger.info('GET /users/me');
    return this.usersService.getMe(user.id);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @CurrentUser() user: JwtPayload & { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    this.logger.info('PATCH /users/me/password');
    return this.usersService.changePassword(user.id, dto);
  }
}
