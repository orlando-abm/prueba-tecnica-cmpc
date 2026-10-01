import { http } from '@/lib/http';
import { toQuery } from '@/lib/query';
import { ENDPOINTS } from '@repo/shared/constants/endpoints';
import type { Book } from '@repo/shared/types/book.types';
import type { BookBodyDto, BookFilters } from '@repo/shared/schemas/book.schema';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

export const booksService = {
  findAll: (filters: Partial<BookFilters> = {}) =>
    http.get<PaginatedResponse<Book>>(`${ENDPOINTS.books.findAll}${toQuery(filters)}`),

  findBySlug: (slug: string, include: string[] = []) =>
    http.get<Book>(`${ENDPOINTS.books.findBySlug(slug)}${toQuery({ include })}`),

  create: (dto: BookBodyDto) => http.post<Book>(ENDPOINTS.books.create, dto),

  update: (id: string, dto: BookBodyDto) => http.patch<Book>(ENDPOINTS.books.update(id), dto),

  remove: (id: string) => http.delete(ENDPOINTS.books.remove(id)),

  restore: (id: string) => http.patch<Book>(ENDPOINTS.books.restore(id), {}),

  exportCsv: (filters: Partial<BookFilters> = {}) =>
    http.blob(`${ENDPOINTS.books.exportCsv}${toQuery(filters)}`),
};
