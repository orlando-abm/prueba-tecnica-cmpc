import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { hash, compare } from 'bcryptjs';
import { UsersRepository } from '@/modules/users/users.repository.js';
import type { LoginDto, RegisterDto } from '@repo/shared/schemas/auth.schema';
import { AUTH_ERRORS } from './auth.errors.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.info({ email: dto.email }, 'Register attempt');

    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      this.logger.warn(
        { email: dto.email, code: AUTH_ERRORS.EMAIL_TAKEN.code },
        'Register failed — email taken',
      );
      throw new ConflictException(AUTH_ERRORS.EMAIL_TAKEN);
    }

    const password = await hash(dto.password, 10);
    const user = await this.users.create({ ...dto, password });

    this.logger.info({ userId: user.id }, 'User registered');
    return { token: this.signToken(user.id, user.email, user.role) };
  }

  async login(dto: LoginDto) {
    this.logger.info({ email: dto.email }, 'Login attempt');

    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(
        { email: dto.email, code: AUTH_ERRORS.INVALID_CREDENTIALS.code },
        'Login failed — user not found',
      );
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const valid = await compare(dto.password, user.password);
    if (!valid) {
      this.logger.warn(
        { email: dto.email, code: AUTH_ERRORS.INVALID_CREDENTIALS.code },
        'Login failed — invalid password',
      );
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    this.logger.info({ userId: user.id }, 'Login success');
    return { token: this.signToken(user.id, user.email, user.role) };
  }

  private signToken(id: string, email: string, role: string) {
    return this.jwt.sign({ sub: id, email, role });
  }
}
