import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Author } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { AuthorsService } from './authors.service.js';
import { AuthorFiltersDto, AuthorBodyDto } from './authors.schema.js';
import { FindAllAuthorsDoc, FindAuthorByIdDoc, CreateAuthorDoc, UpdateAuthorDoc, DeleteAuthorDoc, RestoreAuthorDoc } from './docs/authors.docs.js';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(
    @InjectPinoLogger(AuthorsController.name)
    private readonly logger: PinoLogger,
    private readonly authorsService: AuthorsService,
  ) {}

  @Get()
  @FindAllAuthorsDoc()
  findAll(@Query() filters: AuthorFiltersDto): Promise<PaginatedResponse<Author>> {
    this.logger.info('GET /authors');
    return this.authorsService.findAll(filters);
  }

  @Get(':id')
  @FindAuthorByIdDoc()
  findById(@Param('id') id: string): Promise<Author> {
    this.logger.info(`GET /authors/${id}`);
    return this.authorsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @CreateAuthorDoc()
  create(@Body() dto: AuthorBodyDto): Promise<Author> {
    this.logger.info('POST /authors');
    return this.authorsService.create(dto.name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UpdateAuthorDoc()
  update(@Param('id') id: string, @Body() dto: AuthorBodyDto): Promise<Author> {
    this.logger.info(`PATCH /authors/${id}`);
    return this.authorsService.update(id, dto.name);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RestoreAuthorDoc()
  restore(@Param('id') id: string): Promise<Author> {
    this.logger.info(`PATCH /authors/${id}/restore`);
    return this.authorsService.restore(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteAuthorDoc()
  async softDelete(@Param('id') id: string): Promise<void> {
    this.logger.info(`DELETE /authors/${id}`);
    await this.authorsService.softDelete(id);
  }
}
