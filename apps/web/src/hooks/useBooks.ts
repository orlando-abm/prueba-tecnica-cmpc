import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { booksService } from '@/services/books.service';
import type { BookBodyDto, BookFilters } from '@repo/shared/schemas/book.schema';
import type { Book } from '@repo/shared/types/book.types';
import type { PaginatedResponse } from '@repo/shared/types/pagination.types';

export const BOOKS_KEY = 'books';

type CachedPage = PaginatedResponse<Book>;

function updateInCache(qc: ReturnType<typeof useQueryClient>, updater: (b: Book) => Book) {
  qc.setQueriesData<CachedPage>({ queryKey: [BOOKS_KEY] }, (old) => {
    if (!old) return old;
    return { ...old, items: old.items.map(updater) };
  });
}

export function useBooks(filters: Partial<BookFilters> = {}) {
  return useQuery({
    queryKey: [BOOKS_KEY, filters],
    queryFn: () => booksService.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BookBodyDto) => booksService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BOOKS_KEY] }),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: BookBodyDto }) => booksService.update(id, dto),
    onMutate: ({ id, dto }) => {
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [BOOKS_KEY] });
      updateInCache(qc, (b) => (b.id === id ? { ...b, title: dto.title } : b));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSuccess: (updated) => {
      updateInCache(qc, (b) => (b.id === updated.id ? updated : b));
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => booksService.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [BOOKS_KEY] });
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [BOOKS_KEY] });
      updateInCache(qc, (b) => (b.id === id ? { ...b, deletedAt: new Date().toISOString() } : b));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [BOOKS_KEY] }),
  });
}

export function useRestoreBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => booksService.restore(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [BOOKS_KEY] });
      const previous = qc.getQueriesData<CachedPage>({ queryKey: [BOOKS_KEY] });
      updateInCache(qc, (b) => (b.id === id ? { ...b, deletedAt: null } : b));
      return { previous };
    },
    onError: (_, __, ctx) => {
      for (const [key, data] of ctx?.previous ?? []) qc.setQueryData(key, data);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [BOOKS_KEY] }),
  });
}

export function useExportBooks() {
  return useMutation({
    mutationFn: (filters: Partial<BookFilters> = {}) => booksService.exportCsv(filters),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'libros.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}
