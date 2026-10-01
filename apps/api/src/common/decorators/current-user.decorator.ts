import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy.js';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtPayload & { id: string } => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
