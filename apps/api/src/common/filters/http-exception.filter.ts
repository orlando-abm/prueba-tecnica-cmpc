import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    const error =
      typeof body === 'object' && body !== null && 'code' in body
        ? body
        : { code: 'HTTP_ERROR', message: exception.message };

    response.status(status).json({ success: false, error });
  }
}
