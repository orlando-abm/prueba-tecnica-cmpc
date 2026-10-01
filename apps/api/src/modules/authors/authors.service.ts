import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import type { Author } from '@prisma/client';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { AuthorsRepository } from './authors.repository.js';
import { AUTHOR_ERRORS } from './authors.errors.js';
import type { AuthorFiltersDto } from './authors.schema.js';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectPinoLogger(AuthorsService.name)
    private readonly logger: PinoLogger,
    private readonly authors: AuthorsRepository,
  ) {}

  findAll(filters: AuthorFiltersDto): Promise<PaginatedResponse<Author>> {
    this.logger.info({ filters }, 'Listar autores');
    return this.authors.findAll(filters);
  }

  async findById(id: string): Promise<Author> {
    this.logger.info({ id }, 'Obtener autor por id');
    const author = await this.authors.findById(id);
    if (!author) {
      this.logger.warn({ id, code: AUTHOR_ERRORS.NOT_FOUND.code }, 'Autor no encontrado');
      throw new NotFoundException(AUTHOR_ERRORS.NOT_FOUND);
    }
    return author;
  }

  async create(name: string): Promise<Author> {
    this.logger.info({ name }, 'Crear autor');
    const existing = await this.authors.findByName(name);
    if (existing) {
      const error =
        existing.deletedAt !== null ? AUTHOR_ERRORS.DUPLICATE_DELETED : AUTHOR_ERRORS.DUPLICATE;
      this.logger.warn({ name, code: error.code }, 'Crear fallido — autor ya existe');
      throw new ConflictException(error);
    }
    const author = await this.authors.create(name);
    this.logger.info({ authorId: author.id }, 'Autor creado');
    return author;
  }

  async update(id: string, name: string): Promise<Author> {
    this.logger.info({ id, name }, 'Actualizar autor');
    await this.findById(id);
    const existing = await this.authors.findByName(name);
    if (existing && existing.id !== id) {
      const error =
        existing.deletedAt !== null ? AUTHOR_ERRORS.DUPLICATE_DELETED : AUTHOR_ERRORS.DUPLICATE;
      this.logger.warn({ id, name, code: error.code }, 'Actualizar fallido — autor ya existe');
      throw new ConflictException(error);
    }
    const author = await this.authors.update(id, name);
    this.logger.info({ authorId: author.id }, 'Autor actualizado');
    return author;
  }

  async softDelete(id: string): Promise<void> {
    this.logger.info({ id }, 'Eliminar autor');
    const author = await this.authors.findByIdRaw(id);
    if (!author) {
      this.logger.warn(
        { id, code: AUTHOR_ERRORS.NOT_FOUND.code },
        'Eliminar fallido — autor no encontrado',
      );
      throw new NotFoundException(AUTHOR_ERRORS.NOT_FOUND);
    }
    if (author.deletedAt !== null) {
      this.logger.warn(
        { id, code: AUTHOR_ERRORS.ALREADY_DELETED.code },
        'Eliminar fallido — autor ya está eliminado',
      );
      throw new BadRequestException(AUTHOR_ERRORS.ALREADY_DELETED);
    }
    await this.authors.softDelete(id);
    this.logger.info({ authorId: id }, 'Autor eliminado');
  }

  async restore(id: string): Promise<Author> {
    this.logger.info({ id }, 'Restaurar autor');
    const author = await this.authors.findByIdRaw(id);
    if (!author) {
      this.logger.warn(
        { id, code: AUTHOR_ERRORS.NOT_FOUND.code },
        'Restaurar fallido — autor no encontrado',
      );
      throw new NotFoundException(AUTHOR_ERRORS.NOT_FOUND);
    }
    if (author.deletedAt === null) {
      this.logger.warn(
        { id, code: AUTHOR_ERRORS.NOT_ACTIVE.code },
        'Restaurar fallido — autor ya está activo',
      );
      throw new BadRequestException(AUTHOR_ERRORS.NOT_ACTIVE);
    }
    const restored = await this.authors.restore(id);
    this.logger.info({ authorId: id }, 'Autor restaurado');
    return restored;
  }
}
