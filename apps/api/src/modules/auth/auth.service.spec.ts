import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '@/modules/users/users.repository.js';
import { AuthService } from './auth.service.js';
import { AUTH_ERRORS } from './auth.errors.js';

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

import { compare } from 'bcryptjs';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

const mockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed-password',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: { findByEmail: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    usersRepo = { findByEmail: vi.fn(), create: vi.fn() };
    jwtService = { sign: vi.fn().mockReturnValue('jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: getLoggerToken(AuthService.name), useValue: mockLogger },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('crea el usuario y retorna un token JWT', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);
      usersRepo.create.mockResolvedValue(mockUser());
      const result = await service.register({ email: 'test@example.com', password: '123456', name: 'Test' } as any);
      expect(result).toEqual({ token: 'jwt-token' });
      expect(usersRepo.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'test@example.com', role: 'USER' });
    });

    it('lanza ConflictException si el email ya existe', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser());
      const error = await service.register({ email: 'test@example.com', password: '123456', name: 'Test' } as any).catch((e) => e);
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toMatchObject({ code: AUTH_ERRORS.EMAIL_TAKEN.code });
    });
  });

  describe('login', () => {
    it('retorna un token JWT con credenciales válidas', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser());
      vi.mocked(compare).mockResolvedValue(true as never);
      const result = await service.login({ email: 'test@example.com', password: '123456' });
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);
      const error = await service.login({ email: 'noexiste@example.com', password: '123' }).catch((e) => e);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.getResponse()).toMatchObject({ code: AUTH_ERRORS.INVALID_CREDENTIALS.code });
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser());
      vi.mocked(compare).mockResolvedValue(false as never);
      const error = await service.login({ email: 'test@example.com', password: 'wrong' }).catch((e) => e);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.getResponse()).toMatchObject({ code: AUTH_ERRORS.INVALID_CREDENTIALS.code });
    });
  });
});
