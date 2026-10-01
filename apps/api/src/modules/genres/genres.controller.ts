import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Genre } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { GenresService } from './genres.service.js';
import { GenreFiltersDto, GenreBodyDto } from './genres.schema.js';
import { FindAllGenresDoc, FindGenreByIdDoc, CreateGenreDoc, UpdateGenreDoc, DeleteGenreDoc, RestoreGenreDoc } from './docs/genres.docs.js';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  private readonly logger = new Logger(GenresController.name);

  constructor(private readonly genresService: GenresService) {}

  @Get()
  @FindAllGenresDoc()
  findAll(@Query() filters: GenreFiltersDto): Promise<PaginatedResponse<Genre>> {
    this.logger.log('GET /genres');
    return this.genresService.findAll(filters);
  }

  @Get(':id')
  @FindGenreByIdDoc()
  findById(@Param('id') id: string): Promise<Genre> {
    this.logger.log(`GET /genres/${id}`);
    return this.genresService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @CreateGenreDoc()
  create(@Body() dto: GenreBodyDto): Promise<Genre> {
    this.logger.log('POST /genres');
    return this.genresService.create(dto.name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UpdateGenreDoc()
  update(@Param('id') id: string, @Body() dto: GenreBodyDto): Promise<Genre> {
    this.logger.log(`PATCH /genres/${id}`);
    return this.genresService.update(id, dto.name);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RestoreGenreDoc()
  restore(@Param('id') id: string): Promise<Genre> {
    this.logger.log(`PATCH /genres/${id}/restore`);
    return this.genresService.restore(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteGenreDoc()
  async softDelete(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /genres/${id}`);
    await this.genresService.softDelete(id);
  }
}
