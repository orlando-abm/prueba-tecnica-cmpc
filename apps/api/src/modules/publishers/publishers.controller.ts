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
import type { Publisher } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { PublishersService } from './publishers.service.js';
import { PublisherFiltersDto, PublisherBodyDto } from './publishers.schema.js';
import {
  FindAllPublishersDoc,
  FindPublisherByIdDoc,
  CreatePublisherDoc,
  UpdatePublisherDoc,
  DeletePublisherDoc,
  RestorePublisherDoc,
} from './docs/publishers.docs.js';

@ApiTags('Publishers')
@Controller('publishers')
export class PublishersController {
  constructor(
    @InjectPinoLogger(PublishersController.name)
    private readonly logger: PinoLogger,
    private readonly publishersService: PublishersService,
  ) {}

  @Get()
  @FindAllPublishersDoc()
  findAll(@Query() filters: PublisherFiltersDto): Promise<PaginatedResponse<Publisher>> {
    this.logger.info('GET /publishers');
    return this.publishersService.findAll(filters);
  }

  @Get(':id')
  @FindPublisherByIdDoc()
  findById(@Param('id') id: string): Promise<Publisher> {
    this.logger.info(`GET /publishers/${id}`);
    return this.publishersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @CreatePublisherDoc()
  create(@Body() dto: PublisherBodyDto): Promise<Publisher> {
    this.logger.info('POST /publishers');
    return this.publishersService.create(dto.name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UpdatePublisherDoc()
  update(@Param('id') id: string, @Body() dto: PublisherBodyDto): Promise<Publisher> {
    this.logger.info(`PATCH /publishers/${id}`);
    return this.publishersService.update(id, dto.name);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RestorePublisherDoc()
  restore(@Param('id') id: string): Promise<Publisher> {
    this.logger.info(`PATCH /publishers/${id}/restore`);
    return this.publishersService.restore(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePublisherDoc()
  async softDelete(@Param('id') id: string): Promise<void> {
    this.logger.info(`DELETE /publishers/${id}`);
    await this.publishersService.softDelete(id);
  }
}
