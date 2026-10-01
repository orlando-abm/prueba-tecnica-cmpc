import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { COMMON_ERRORS } from '@common/errors/common.errors.js';

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const zodError = exception.getZodError();
    const message = zodError.errors
      .map((e) => (e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message))
      .join(', ');

    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: { ...COMMON_ERRORS.VALIDATION_ERROR, message },
    });
  }
}
