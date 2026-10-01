import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginSchema, RegisterSchema } from '@repo/shared/schemas/auth.schema';
import { createZodDto } from 'nestjs-zod';
import { RegisterDoc, LoginDoc } from './docs/auth.docs.js';

class LoginDto extends createZodDto(LoginSchema) {}
class RegisterDto extends createZodDto(RegisterSchema) {}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RegisterDoc()
  register(@Body() dto: RegisterDto) {
    this.logger.log('POST /auth/register');
    return this.authService.register(dto);
  }

  @Post('login')
  @LoginDoc()
  login(@Body() dto: LoginDto) {
    this.logger.log('POST /auth/login');
    return this.authService.login(dto);
  }
}
