import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { PublishersController } from './publishers.controller.js';
import { PublishersService } from './publishers.service.js';
import { PublishersRepository } from './publishers.repository.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PublishersController],
  providers: [PublishersService, PublishersRepository],
  exports: [PublishersService],
})
export class PublishersModule {}
