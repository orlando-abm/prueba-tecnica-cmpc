import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { genresService } from '@/services/genres.service'
import type { GenreBodyDto, GenreFilters } from '@repo/shared/schemas/genre.schema'
import type { Genre } from '@repo/shared/types/genre.types'
import type { PaginatedResponse } from '@repo/shared/types/pagination.types'

export const GENRES_KEY = 'genres'

type CachedPage = PaginatedResponse<Genre>

function updateInCache(qc: ReturnType<typeof useQueryClient>, updater: (g: Genre) => Genre) {
  qc.setQueriesData<CachedPage>({ queryKey: [GENRES_KEY] }, old => {
    if (!old) return old
    return { ...old, items: old.items.map(updater) }
  })
}

export function useGenres(filters: Partial<GenreFilters> = {}) {
  return useQuery({
    queryKey: [GENRES_KEY, filters],
    queryFn: () => genresService.findAll(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCreateGenre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: GenreBodyDto) => genresService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GENRES_KEY] }),
  })
}

export function useUpdateGenre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: GenreBodyDto }) => genresService.update(id, dto),
    onMutate: ({ id, dto }) => {
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [GENRES_KEY] })
      updateInCache(qc, g => g.id === id ? { ...g, name: dto.name } : g)
      return { previous }
    },
    onError: (_, __, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSuccess: (updated) => {
      updateInCache(qc, g => g.id === updated.id ? updated : g)
    },
  })
}

export function useDeleteGenre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => genresService.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [GENRES_KEY] })
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [GENRES_KEY] })
      updateInCache(qc, g => g.id === id ? { ...g, deletedAt: new Date().toISOString() } : g)
      return { previous }
    },
    onError: (_, __, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [GENRES_KEY] }),
  })
}

export function useRestoreGenre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => genresService.restore(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [GENRES_KEY] })
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [GENRES_KEY] })
      updateInCache(qc, g => g.id === id ? { ...g, deletedAt: null } : g)
      return { previous }
    },
    onError: (_, __, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [GENRES_KEY] }),
  })
}
