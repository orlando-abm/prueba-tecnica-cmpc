import { z } from 'zod'
import { PaginationSchema } from './pagination.schema.js'

export const AuthorBodySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim()
    .transform(s => s.replace(/\s+/g, ' ')),
})

export type AuthorBodyDto = z.infer<typeof AuthorBodySchema>

export const AuthorFiltersSchema = PaginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('active'),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
})

export type AuthorFilters = z.infer<typeof AuthorFiltersSchema>
