import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Request } from 'express';
import { setCurrentUserId } from '@/common/context/request-context.js';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export class UserContextInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (req.user?.id) {
      setCurrentUserId(req.user.id);
    }
    return next.handle();
  }
}
