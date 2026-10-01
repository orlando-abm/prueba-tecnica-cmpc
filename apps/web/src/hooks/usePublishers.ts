import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { publishersService } from '@/services/publishers.service';
import type { PublisherBodyDto, PublisherFilters } from '@repo/shared/schemas/publisher.schema';
import type { Publisher } from '@repo/shared/types/publisher.types';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

export const PUBLISHERS_KEY = 'publishers';

type CachedPage = PaginatedResponse<Publisher>;

function updateInCache(
  qc: ReturnType<typeof useQueryClient>,
  updater: (p: Publisher) => Publisher,
) {
  qc.setQueriesData<CachedPage>({ queryKey: [PUBLISHERS_KEY] }, (old) => {
    if (!old) return old;
    return { ...old, items: old.items.map(updater) };
  });
}

export function usePublishers(filters: Partial<PublisherFilters> = {}) {
  return useQuery({
    queryKey: [PUBLISHERS_KEY, filters],
    queryFn: () => publishersService.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePublisher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PublisherBodyDto) => publishersService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PUBLISHERS_KEY] }),
  });
}

export function useUpdatePublisher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PublisherBodyDto }) =>
      publishersService.update(id, dto),
    onMutate: ({ id, dto }) => {
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [PUBLISHERS_KEY] });
      updateInCache(qc, (p) => (p.id === id ? { ...p, name: dto.name } : p));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSuccess: (updated) => {
      updateInCache(qc, (p) => (p.id === updated.id ? updated : p));
    },
  });
}

export function useDeletePublisher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishersService.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [PUBLISHERS_KEY] });
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [PUBLISHERS_KEY] });
      updateInCache(qc, (p) => (p.id === id ? { ...p, deletedAt: new Date().toISOString() } : p));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [PUBLISHERS_KEY] }),
  });
}

export function useRestorePublisher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishersService.restore(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [PUBLISHERS_KEY] });
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [PUBLISHERS_KEY] });
      updateInCache(qc, (p) => (p.id === id ? { ...p, deletedAt: null } : p));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [PUBLISHERS_KEY] }),
  });
}
