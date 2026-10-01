import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { AuthorsController } from './authors.controller.js';
import { AuthorsService } from './authors.service.js';
import { AuthorsRepository } from './authors.repository.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, AuthorsRepository],
  exports: [AuthorsService],
})
export class AuthorsModule {}
