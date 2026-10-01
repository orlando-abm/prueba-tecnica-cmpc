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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Genre } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { GenresService } from './genres.service.js';
import { GenreFiltersDto, GenreBodyDto } from './genres.schema.js';
import {
  FindAllGenresDoc,
  FindGenreByIdDoc,
  CreateGenreDoc,
  UpdateGenreDoc,
  DeleteGenreDoc,
  RestoreGenreDoc,
} from './docs/genres.docs.js';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(
    @InjectPinoLogger(GenresController.name)
    private readonly logger: PinoLogger,
    private readonly genresService: GenresService,
  ) {}

  @Get()
  @FindAllGenresDoc()
  findAll(@Query() filters: GenreFiltersDto): Promise<PaginatedResponse<Genre>> {
    this.logger.info('GET /genres');
    return this.genresService.findAll(filters);
  }

  @Get(':id')
  @FindGenreByIdDoc()
  findById(@Param('id') id: string): Promise<Genre> {
    this.logger.info(`GET /genres/${id}`);
    return this.genresService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @CreateGenreDoc()
  create(@Body() dto: GenreBodyDto): Promise<Genre> {
    this.logger.info('POST /genres');
    return this.genresService.create(dto.name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UpdateGenreDoc()
  update(@Param('id') id: string, @Body() dto: GenreBodyDto): Promise<Genre> {
    this.logger.info(`PATCH /genres/${id}`);
    return this.genresService.update(id, dto.name);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RestoreGenreDoc()
  restore(@Param('id') id: string): Promise<Genre> {
    this.logger.info(`PATCH /genres/${id}/restore`);
    return this.genresService.restore(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteGenreDoc()
  async softDelete(@Param('id') id: string): Promise<void> {
    this.logger.info(`DELETE /genres/${id}`);
    await this.genresService.softDelete(id);
  }
}
