import { http } from '@/lib/http';
import { ENDPOINTS } from '@repo/shared/constants/endpoints';
import type { Publisher } from '@repo/shared/types/publisher.types';
import type { PublisherBodyDto, PublisherFilters } from '@repo/shared/schemas/publisher.schema';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

function toQuery(filters: Partial<PublisherFilters>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  return params.size ? `?${params.toString()}` : '';
}

export const publishersService = {
  findAll: (filters: Partial<PublisherFilters> = {}) =>
    http.get<PaginatedResponse<Publisher>>(`${ENDPOINTS.publishers.findAll}${toQuery(filters)}`),

  create: (dto: PublisherBodyDto) => http.post<Publisher>(ENDPOINTS.publishers.create, dto),

  update: (id: string, dto: PublisherBodyDto) =>
    http.patch<Publisher>(ENDPOINTS.publishers.update(id), dto),

  remove: (id: string) => http.delete(ENDPOINTS.publishers.remove(id)),

  restore: (id: string) => http.patch<Publisher>(ENDPOINTS.publishers.restore(id), {}),
};
