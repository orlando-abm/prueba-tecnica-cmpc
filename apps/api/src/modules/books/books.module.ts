import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import { BooksRepository } from './books.repository.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
  exports: [BooksService],
})
export class BooksModule {}
