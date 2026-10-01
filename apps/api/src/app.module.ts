import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from '@/database/database.module.js';
import { UsersModule } from '@/modules/users/users.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { GenresModule } from '@/modules/genres/genres.module.js';
import { AuthorsModule } from '@/modules/authors/authors.module.js';
import { CorrelationIdMiddleware } from '@/common/middlewares/correlation-id.middleware.js';
import { loggerConfig } from '@/config/logger.config.js';
import { validateEnv } from '@/config/env.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRootAsync({ useFactory: loggerConfig }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    GenresModule,
    AuthorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('{*path}');
  }
}
