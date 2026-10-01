import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import type { Publisher } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { PublishersRepository } from './publishers.repository.js';
import { PUBLISHER_ERRORS } from './publishers.errors.js';
import type { PublisherFiltersDto } from './publishers.schema.js';

@Injectable()
export class PublishersService {
  constructor(
    @InjectPinoLogger(PublishersService.name)
    private readonly logger: PinoLogger,
    private readonly publishers: PublishersRepository,
  ) {}

  findAll(filters: PublisherFiltersDto): Promise<PaginatedResponse<Publisher>> {
    this.logger.info({ filters }, 'Listar editoriales');
    return this.publishers.findAll(filters);
  }

  async findById(id: string): Promise<Publisher> {
    this.logger.info({ id }, 'Obtener editorial por id');
    const publisher = await this.publishers.findById(id);
    if (!publisher) {
      this.logger.warn({ id, code: PUBLISHER_ERRORS.NOT_FOUND.code }, 'Editorial no encontrada');
      throw new NotFoundException(PUBLISHER_ERRORS.NOT_FOUND);
    }
    return publisher;
  }

  async create(name: string): Promise<Publisher> {
    this.logger.info({ name }, 'Crear editorial');
    const existing = await this.publishers.findByName(name);
    if (existing) {
      const error =
        existing.deletedAt !== null
          ? PUBLISHER_ERRORS.DUPLICATE_DELETED
          : PUBLISHER_ERRORS.DUPLICATE;
      this.logger.warn({ name, code: error.code }, 'Crear fallido — editorial ya existe');
      throw new ConflictException(error);
    }
    const publisher = await this.publishers.create(name);
    this.logger.info({ publisherId: publisher.id }, 'Editorial creada');
    return publisher;
  }

  async update(id: string, name: string): Promise<Publisher> {
    this.logger.info({ id, name }, 'Actualizar editorial');
    await this.findById(id);
    const existing = await this.publishers.findByName(name);
    if (existing && existing.id !== id) {
      const error =
        existing.deletedAt !== null
          ? PUBLISHER_ERRORS.DUPLICATE_DELETED
          : PUBLISHER_ERRORS.DUPLICATE;
      this.logger.warn({ id, name, code: error.code }, 'Actualizar fallido — editorial ya existe');
      throw new ConflictException(error);
    }
    const publisher = await this.publishers.update(id, name);
    this.logger.info({ publisherId: publisher.id }, 'Editorial actualizada');
    return publisher;
  }

  async softDelete(id: string): Promise<void> {
    this.logger.info({ id }, 'Eliminar editorial');
    const publisher = await this.publishers.findByIdRaw(id);
    if (!publisher) {
      this.logger.warn(
        { id, code: PUBLISHER_ERRORS.NOT_FOUND.code },
        'Eliminar fallido — editorial no encontrada',
      );
      throw new NotFoundException(PUBLISHER_ERRORS.NOT_FOUND);
    }
    if (publisher.deletedAt !== null) {
      this.logger.warn(
        { id, code: PUBLISHER_ERRORS.ALREADY_DELETED.code },
        'Eliminar fallido — editorial ya está eliminada',
      );
      throw new BadRequestException(PUBLISHER_ERRORS.ALREADY_DELETED);
    }
    await this.publishers.softDelete(id);
    this.logger.info({ publisherId: id }, 'Editorial eliminada');
  }

  async restore(id: string): Promise<Publisher> {
    this.logger.info({ id }, 'Restaurar editorial');
    const publisher = await this.publishers.findByIdRaw(id);
    if (!publisher) {
      this.logger.warn(
        { id, code: PUBLISHER_ERRORS.NOT_FOUND.code },
        'Restaurar fallido — editorial no encontrada',
      );
      throw new NotFoundException(PUBLISHER_ERRORS.NOT_FOUND);
    }
    if (publisher.deletedAt === null) {
      this.logger.warn(
        { id, code: PUBLISHER_ERRORS.NOT_ACTIVE.code },
        'Restaurar fallido — editorial ya está activa',
      );
      throw new BadRequestException(PUBLISHER_ERRORS.NOT_ACTIVE);
    }
    const restored = await this.publishers.restore(id);
    this.logger.info({ publisherId: id }, 'Editorial restaurada');
    return restored;
  }
}
