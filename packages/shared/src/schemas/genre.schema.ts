import { z } from 'zod'
import { PaginationSchema } from './pagination.schema.js'

export const GenreBodySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim(),
})

export type GenreBodyDto = z.infer<typeof GenreBodySchema>

export const GenreFiltersSchema = PaginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('active'),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
})

export type GenreFilters = z.infer<typeof GenreFiltersSchema>
