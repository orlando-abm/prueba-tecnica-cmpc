import { http } from '@/lib/http'
import { ENDPOINTS } from '@repo/shared/constants/endpoints'
import type { Author } from '@repo/shared/types/author.types'
import type { AuthorBodyDto, AuthorFilters } from '@repo/shared/schemas/author.schema'
import type { PaginatedResponse } from '@repo/shared/types/pagination.types'

function toQuery(filters: Partial<AuthorFilters>): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  return params.size ? `?${params.toString()}` : ''
}

export const authorsService = {
  findAll: (filters: Partial<AuthorFilters> = {}) =>
    http.get<PaginatedResponse<Author>>(`${ENDPOINTS.authors.findAll}${toQuery(filters)}`),

  create: (dto: AuthorBodyDto) =>
    http.post<Author>(ENDPOINTS.authors.create, dto),

  update: (id: string, dto: AuthorBodyDto) =>
    http.patch<Author>(ENDPOINTS.authors.update(id), dto),

  remove: (id: string) =>
    http.delete(ENDPOINTS.authors.remove(id)),

  restore: (id: string) =>
    http.patch<Author>(ENDPOINTS.authors.restore(id), {}),
}
