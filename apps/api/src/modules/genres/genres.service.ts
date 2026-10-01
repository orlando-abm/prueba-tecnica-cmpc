import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import type { Genre } from '@prisma/client';
import { generateUniqueSlug } from '@common/utils/slugify.js';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';
import { GenresRepository } from './genres.repository.js';
import { GENRE_ERRORS } from './genres.errors.js';
import type { GenreFiltersDto } from './genres.schema.js';
import { AuditService, AuditAction } from '@/modules/audit/audit.service.js';

@Injectable()
export class GenresService {
  constructor(
    @InjectPinoLogger(GenresService.name)
    private readonly logger: PinoLogger,
    private readonly genres: GenresRepository,
    private readonly audit: AuditService,
  ) {}

  findAll(filters: GenreFiltersDto): Promise<PaginatedResponse<Genre>> {
    this.logger.info({ filters }, 'Listar géneros');
    return this.genres.findAll(filters);
  }

  async findById(id: string): Promise<Genre> {
    this.logger.info({ id }, 'Obtener género por id');
    const genre = await this.genres.findById(id);
    if (!genre) {
      this.logger.warn({ id, code: GENRE_ERRORS.NOT_FOUND.code }, 'Género no encontrado');
      throw new NotFoundException(GENRE_ERRORS.NOT_FOUND);
    }
    return genre;
  }

  async create(name: string): Promise<Genre> {
    this.logger.info({ name }, 'Crear género');
    const existing = await this.genres.findByName(name);
    if (existing) {
      const error =
        existing.deletedAt !== null ? GENRE_ERRORS.DUPLICATE_DELETED : GENRE_ERRORS.DUPLICATE;
      this.logger.warn({ name, code: error.code }, 'Crear fallido — género ya existe');
      throw new ConflictException(error);
    }
    const slug = await generateUniqueSlug(name, async (s) => {
      const bySlug = await this.genres.findBySlugRaw(s);
      return bySlug !== null;
    });
    const genre = await this.genres.create(name, slug);
    this.logger.info({ genreId: genre.id }, 'Género creado');
    this.audit.log(AuditAction.CREATE, 'Genre', genre.id, { name });
    return genre;
  }

  async update(id: string, name: string): Promise<Genre> {
    this.logger.info({ id, name }, 'Actualizar género');
    const existing = await this.findById(id);
    const byName = await this.genres.findByName(name);
    if (byName && byName.id !== id) {
      const error =
        byName.deletedAt !== null ? GENRE_ERRORS.DUPLICATE_DELETED : GENRE_ERRORS.DUPLICATE;
      this.logger.warn({ id, name, code: error.code }, 'Actualizar fallido — género ya existe');
      throw new ConflictException(error);
    }
    let slug: string | undefined;
    if (name !== existing.name) {
      slug = await generateUniqueSlug(name, async (s) => {
        const bySlug = await this.genres.findBySlugRaw(s);
        return bySlug !== null && bySlug.id !== id;
      });
    }
    const genre = await this.genres.update(id, name, slug);
    this.logger.info({ genreId: genre.id }, 'Género actualizado');
    this.audit.log(AuditAction.UPDATE, 'Genre', genre.id, { name });
    return genre;
  }

  async softDelete(id: string): Promise<void> {
    this.logger.info({ id }, 'Eliminar género');
    const genre = await this.genres.findByIdRaw(id);
    if (!genre) {
      this.logger.warn(
        { id, code: GENRE_ERRORS.NOT_FOUND.code },
        'Eliminar fallido — género no encontrado',
      );
      throw new NotFoundException(GENRE_ERRORS.NOT_FOUND);
    }
    if (genre.deletedAt !== null) {
      this.logger.warn(
        { id, code: GENRE_ERRORS.ALREADY_DELETED.code },
        'Eliminar fallido — género ya está eliminado',
      );
      throw new BadRequestException(GENRE_ERRORS.ALREADY_DELETED);
    }
    await this.genres.softDelete(id);
    this.logger.info({ genreId: id }, 'Género eliminado');
    this.audit.log(AuditAction.DELETE, 'Genre', id, {});
  }

  async restore(id: string): Promise<Genre> {
    this.logger.info({ id }, 'Restaurar género');
    const genre = await this.genres.findByIdRaw(id);
    if (!genre) {
      this.logger.warn(
        { id, code: GENRE_ERRORS.NOT_FOUND.code },
        'Restaurar fallido — género no encontrado',
      );
      throw new NotFoundException(GENRE_ERRORS.NOT_FOUND);
    }
    if (genre.deletedAt === null) {
      this.logger.warn(
        { id, code: GENRE_ERRORS.NOT_ACTIVE.code },
        'Restaurar fallido — género ya está activo',
      );
      throw new BadRequestException(GENRE_ERRORS.NOT_ACTIVE);
    }
    const restored = await this.genres.restore(id);
    this.logger.info({ genreId: id }, 'Género restaurado');
    this.audit.log(AuditAction.UPDATE, 'Genre', id, { restored: true });
    return restored;
  }
}
