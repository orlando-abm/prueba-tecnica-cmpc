import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { SuccessResponse } from '@repo/shared/types/response.types';

export class ResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<SuccessResponse> {
    return next.handle().pipe(
      map((data): SuccessResponse => ({ success: true, data })),
    );
  }
}
