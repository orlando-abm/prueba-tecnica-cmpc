import { CORRELATION_ID_HEADER } from '@common/constants/index.js';
import { getCorrelationId } from '@common/context/request-context.js';

export const loggerConfig = () => ({
  pinoHttp: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              messageKey: 'message',
              colorize: true,
            },
          }
        : undefined,
    messageKey: 'message',
    mixin: () => ({ correlationId: getCorrelationId() }),
    customProps: (req: { headers: Record<string, unknown> }) => ({
      correlationId: req.headers[CORRELATION_ID_HEADER],
    }),
    autoLogging: false,
    serializers: {
      req: () => undefined,
      res: () => undefined,
    },
  },
});
