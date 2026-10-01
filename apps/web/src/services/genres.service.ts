import { http } from '@/lib/http';
import { toQuery } from '@/lib/query';
import { ENDPOINTS } from '@repo/shared/constants/endpoints';
import type { Genre } from '@repo/shared/types/genre.types';
import type { GenreBodyDto, GenreFilters } from '@repo/shared/schemas/genre.schema';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

export const genresService = {
  findAll: (filters: Partial<GenreFilters> = {}) =>
    http.get<PaginatedResponse<Genre>>(`${ENDPOINTS.genres.findAll}${toQuery(filters)}`),

  create: (dto: GenreBodyDto) => http.post<Genre>(ENDPOINTS.genres.create, dto),

  update: (id: string, dto: GenreBodyDto) => http.patch<Genre>(ENDPOINTS.genres.update(id), dto),

  remove: (id: string) => http.delete(ENDPOINTS.genres.remove(id)),

  restore: (id: string) => http.patch<Genre>(ENDPOINTS.genres.restore(id), {}),
};
