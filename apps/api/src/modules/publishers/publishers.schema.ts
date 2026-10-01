import { createZodDto } from 'nestjs-zod';
import { PublisherFiltersSchema, PublisherBodySchema } from '@repo/shared/schemas/publisher.schema';

export { PublisherFiltersSchema, PublisherBodySchema };

export class PublisherFiltersDto extends createZodDto(PublisherFiltersSchema) {}
export class PublisherBodyDto extends createZodDto(PublisherBodySchema) {}
