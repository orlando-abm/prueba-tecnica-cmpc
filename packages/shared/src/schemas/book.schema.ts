import { z } from 'zod';
import { PaginationSchema } from './pagination.schema.js';

export const BookBodySchema = z.object({
  title: z
    .string({ required_error: 'El título es requerido' })
    .min(1, 'El título es requerido')
    .max(255, 'El título no puede superar 255 caracteres')
    .trim()
    .transform((s) => s.replace(/\s+/g, ' ')),
  authorId: z.string({ required_error: 'El autor es requerido' }).uuid('ID de autor inválido'),
  publisherId: z
    .string({ required_error: 'La editorial es requerida' })
    .uuid('ID de editorial inválido'),
  genreId: z.string({ required_error: 'El género es requerido' }).uuid('ID de género inválido'),
  price: z.coerce
    .number({
      required_error: 'El precio es requerido',
      invalid_type_error: 'El precio debe ser un número',
    })
    .positive('El precio debe ser mayor a 0'),
  stock: z.coerce
    .number({ invalid_type_error: 'El stock debe ser un número' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),
  isbn: z
    .string()
    .min(1, 'El ISBN no puede estar vacío')
    .max(20, 'El ISBN no puede superar 20 caracteres')
    .optional(),
  sku: z
    .string()
    .min(1, 'El SKU no puede estar vacío')
    .max(50, 'El SKU no puede superar 50 caracteres')
    .optional(),
  synopsis: z.string().max(2000, 'La sinopsis no puede superar 2000 caracteres').optional(),
  language: z.string().max(50, 'El idioma no puede superar 50 caracteres').optional(),
  pages: z.coerce
    .number({ invalid_type_error: 'Las páginas deben ser un número' })
    .int('Las páginas deben ser un número entero')
    .positive('Las páginas deben ser mayor a 0')
    .optional(),
  year: z.coerce
    .number({ invalid_type_error: 'El año debe ser un número' })
    .int('El año debe ser un número entero')
    .min(1000, 'El año no es válido')
    .max(new Date().getFullYear() + 5, 'El año no puede ser tan lejano en el futuro')
    .optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
});

export type BookBodyDto = z.infer<typeof BookBodySchema>;

export const BookFiltersSchema = PaginationSchema.extend({
  search: z.string().optional(),
  slug: z.string().optional(),
  genreId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  publisherId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('active'),
  available: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['title', 'price', 'year', 'stock', 'createdAt']).default('title'),
  include: z
    .preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z.array(z.enum(['genre', 'author', 'publisher'])),
    )
    .default(['genre', 'author', 'publisher']),
});

export type BookFilters = z.infer<typeof BookFiltersSchema>;
