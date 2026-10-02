import { useQuery } from '@tanstack/react-query';
import { booksService } from '@/services/books.service';
import { useBookStore } from '@/store/bookStore';
import type { ApiError } from '@/lib/http';

export const BOOK_DETAIL_KEY = 'book';

export function useBookDetail(slug: string) {
  const selectedBook = useBookStore((s) => s.selectedBook);
  const hasData = selectedBook?.slug === slug;

  const query = useQuery({
    queryKey: [BOOK_DETAIL_KEY, slug],
    queryFn: () => booksService.findBySlug(slug, ['genre', 'author', 'publisher']),
    initialData: hasData ? selectedBook ?? undefined : undefined,
  });

  const book = query.data ?? null;
  const isNotFound = query.isError && (query.error as ApiError)?.status === 404;

  return { book, isLoading: !book && query.isLoading, isNotFound };
}
