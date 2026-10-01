import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { zodV3ToOpenAPI as zodToOpenAPI } from 'nestjs-zod';
import { LoginSchema, RegisterSchema } from '@repo/shared/schemas/auth.schema';
import { AUTH_ERRORS } from '../auth.errors.js';
import { COMMON_ERRORS } from '@common/errors/common.errors.js';

export const RegisterDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Registrar usuario' }),
    ApiBody({ schema: zodToOpenAPI(RegisterSchema) }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Usuario registrado',
      schema: {
        example: {
          success: true,
          data: { token: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: AUTH_ERRORS.EMAIL_TAKEN.message,
      schema: {
        example: { success: false, error: AUTH_ERRORS.EMAIL_TAKEN },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: {
        example: {
          success: false,
          error: { ...COMMON_ERRORS.VALIDATION_ERROR, message: 'email: Invalid email' },
        },
      },
    }),
  );

export const LoginDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Iniciar sesión' }),
    ApiBody({ schema: zodToOpenAPI(LoginSchema) }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login exitoso',
      schema: {
        example: {
          success: true,
          data: { token: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: AUTH_ERRORS.INVALID_CREDENTIALS.message,
      schema: {
        example: { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS },
      },
    }),
  );
