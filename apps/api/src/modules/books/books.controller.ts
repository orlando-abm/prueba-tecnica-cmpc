import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import type { BookWithRelations } from './books.repository.js';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { BooksService } from './books.service.js';
import { BookFiltersDto, BookBodyDto } from './books.schema.js';
import {
  FindAllBooksDoc,
  FindBookByIdDoc,
  FindBookBySlugDoc,
  CreateBookDoc,
  UpdateBookDoc,
  DeleteBookDoc,
  RestoreBookDoc,
  ExportCsvDoc,
} from './docs/books.docs.js';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    @InjectPinoLogger(BooksController.name)
    private readonly logger: PinoLogger,
    private readonly booksService: BooksService,
  ) {}

  @Get()
  @FindAllBooksDoc()
  findAll(@Query() filters: BookFiltersDto): Promise<PaginatedResponse<BookWithRelations>> {
    this.logger.info('GET /books');
    return this.booksService.findAll(filters);
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ExportCsvDoc()
  async exportCsv(
    @Query() filters: BookFiltersDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    this.logger.info('GET /books/export/csv');
    const csv = await this.booksService.exportCsv(filters);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="libros.csv"');
    return csv;
  }

  @Get('slug/:slug')
  @FindBookBySlugDoc()
  findBySlug(
    @Param('slug') slug: string,
    @Query('include') include?: string | string[],
  ): Promise<BookWithRelations> {
    this.logger.info(`GET /books/slug/${slug}`);
    const raw = include === undefined ? [] : Array.isArray(include) ? include : [include];
    const allowed = ['genre', 'author', 'publisher'];
    return this.booksService.findBySlug(
      slug,
      raw.filter((v) => allowed.includes(v)),
    );
  }

  @Get(':id')
  @FindBookByIdDoc()
  findById(
    @Param('id') id: string,
    @Query('include') include?: string | string[],
  ): Promise<BookWithRelations> {
    this.logger.info(`GET /books/${id}`);
    const raw = include === undefined ? [] : Array.isArray(include) ? include : [include];
    const allowed = ['genre', 'author', 'publisher'];
    return this.booksService.findById(
      id,
      raw.filter((v) => allowed.includes(v)),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @CreateBookDoc()
  create(@Body() dto: BookBodyDto): Promise<BookWithRelations> {
    this.logger.info('POST /books');
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UpdateBookDoc()
  update(@Param('id') id: string, @Body() dto: BookBodyDto): Promise<BookWithRelations> {
    this.logger.info(`PATCH /books/${id}`);
    return this.booksService.update(id, dto);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RestoreBookDoc()
  restore(@Param('id') id: string): Promise<BookWithRelations> {
    this.logger.info(`PATCH /books/${id}/restore`);
    return this.booksService.restore(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteBookDoc()
  async softDelete(@Param('id') id: string): Promise<void> {
    this.logger.info(`DELETE /books/${id}`);
    await this.booksService.softDelete(id);
  }
}
