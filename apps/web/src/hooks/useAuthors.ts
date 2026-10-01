import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { authorsService } from '@/services/authors.service';
import type { AuthorBodyDto, AuthorFilters } from '@repo/shared/schemas/author.schema';
import type { Author } from '@repo/shared/types/author.types';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

export const AUTHORS_KEY = 'authors';

type CachedPage = PaginatedResponse<Author>;

function updateInCache(qc: ReturnType<typeof useQueryClient>, updater: (a: Author) => Author) {
  qc.setQueriesData<CachedPage>({ queryKey: [AUTHORS_KEY] }, (old) => {
    if (!old) return old;
    return { ...old, items: old.items.map(updater) };
  });
}

export function useAuthors(filters: Partial<AuthorFilters> = {}) {
  return useQuery({
    queryKey: [AUTHORS_KEY, filters],
    queryFn: () => authorsService.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AuthorBodyDto) => authorsService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AUTHORS_KEY] }),
  });
}

export function useUpdateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AuthorBodyDto }) => authorsService.update(id, dto),
    onMutate: ({ id, dto }) => {
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [AUTHORS_KEY] });
      updateInCache(qc, (a) => (a.id === id ? { ...a, name: dto.name } : a));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSuccess: (updated) => {
      updateInCache(qc, (a) => (a.id === updated.id ? updated : a));
    },
  });
}

export function useDeleteAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authorsService.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [AUTHORS_KEY] });
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [AUTHORS_KEY] });
      updateInCache(qc, (a) => (a.id === id ? { ...a, deletedAt: new Date().toISOString() } : a));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [AUTHORS_KEY] }),
  });
}

export function useRestoreAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authorsService.restore(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [AUTHORS_KEY] });
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [AUTHORS_KEY] });
      updateInCache(qc, (a) => (a.id === id ? { ...a, deletedAt: null } : a));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [AUTHORS_KEY] }),
  });
}
