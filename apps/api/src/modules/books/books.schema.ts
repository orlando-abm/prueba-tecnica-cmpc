import { createZodDto } from 'nestjs-zod';
import { BookFiltersSchema, BookBodySchema } from '@repo/shared/schemas/book.schema';

export { BookFiltersSchema, BookBodySchema };

export class BookFiltersDto extends createZodDto(BookFiltersSchema) {}
export class BookBodyDto extends createZodDto(BookBodySchema) {}
