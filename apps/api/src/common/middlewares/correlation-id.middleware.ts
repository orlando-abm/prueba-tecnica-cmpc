import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { CORRELATION_ID_HEADER } from '@/common/constants/index.js';
import { requestContext } from '@/common/context/request-context.js';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
    req.headers[CORRELATION_ID_HEADER] = id;
    res.setHeader(CORRELATION_ID_HEADER, id);

    requestContext.run({ correlationId: id }, next);
  }
}
