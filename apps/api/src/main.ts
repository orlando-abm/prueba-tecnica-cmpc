import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from '@/app.module.js';
import { setupSwagger } from '@/config/swagger.config.js';
import { corsConfig } from '@/config/cors.config.js';
import { ZodExceptionFilter } from '@/common/filters/zod-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.enableCors(corsConfig);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ZodExceptionFilter());

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
