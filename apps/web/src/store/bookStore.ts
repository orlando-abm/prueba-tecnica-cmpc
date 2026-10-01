import { create } from 'zustand';
import type { Book } from '@repo/shared/types/book.types';

interface BookStore {
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
}

export const useBookStore = create<BookStore>((set) => ({
  selectedBook: null,
  setSelectedBook: (book) => set({ selectedBook: book }),
}));
