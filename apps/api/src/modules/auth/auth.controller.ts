import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AuthService } from './auth.service.js';
import { LoginSchema, RegisterSchema } from '@repo/shared/schemas/auth.schema';
import { createZodDto } from 'nestjs-zod';
import { RegisterDoc, LoginDoc } from './docs/auth.docs.js';

class LoginDto extends createZodDto(LoginSchema) {}
class RegisterDto extends createZodDto(RegisterSchema) {}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectPinoLogger(AuthController.name)
    private readonly logger: PinoLogger,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @RegisterDoc()
  register(@Body() dto: RegisterDto) {
    this.logger.info('POST /auth/register');
    return this.authService.register(dto);
  }

  @Post('login')
  @LoginDoc()
  login(@Body() dto: LoginDto) {
    this.logger.info('POST /auth/login');
    return this.authService.login(dto);
  }
}
