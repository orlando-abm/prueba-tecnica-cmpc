import { createZodDto } from 'nestjs-zod';
import { GenreFiltersSchema, GenreBodySchema } from '@repo/shared/schemas/genre.schema';

export { GenreFiltersSchema, GenreBodySchema };

export class GenreFiltersDto extends createZodDto(GenreFiltersSchema) {}
export class GenreBodyDto extends createZodDto(GenreBodySchema) {}
