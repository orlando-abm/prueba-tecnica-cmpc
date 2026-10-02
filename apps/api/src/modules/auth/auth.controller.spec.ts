import { Test, type TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    service = { register: vi.fn(), login: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: getLoggerToken(AuthController.name), useValue: mockLogger },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('register', () => {
    it('llama a service.register y retorna el token', async () => {
      service.register.mockResolvedValue({ token: 'jwt-token' });
      const dto = { email: 'test@example.com', password: '123456', name: 'Test' } as any;
      await expect(controller.register(dto)).resolves.toEqual({ token: 'jwt-token' });
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('llama a service.login y retorna el token', async () => {
      service.login.mockResolvedValue({ token: 'jwt-token' });
      const dto = { email: 'test@example.com', password: '123456' } as any;
      await expect(controller.login(dto)).resolves.toEqual({ token: 'jwt-token' });
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });
});
