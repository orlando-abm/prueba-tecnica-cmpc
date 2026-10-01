import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { GenresController } from './genres.controller.js';
import { GenresService } from './genres.service.js';
import { GenresRepository } from './genres.repository.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [GenresController],
  providers: [GenresService, GenresRepository],
  exports: [GenresService, GenresRepository],
})
export class GenresModule {}
