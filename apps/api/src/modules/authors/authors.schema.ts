import { createZodDto } from 'nestjs-zod';
import { AuthorFiltersSchema, AuthorBodySchema } from '@repo/shared/schemas/author.schema';

export { AuthorFiltersSchema, AuthorBodySchema };

export class AuthorFiltersDto extends createZodDto(AuthorFiltersSchema) {}
export class AuthorBodyDto extends createZodDto(AuthorBodySchema) {}
