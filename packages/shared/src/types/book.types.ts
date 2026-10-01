export interface Book {
  id: string;
  title: string;
  slug: string;
  isbn: string | null;
  sku: string | null;
  synopsis: string | null;
  language: string | null;
  pages: number | null;
  year: number | null;
  price: string;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  genreId: string;
  authorId: string;
  publisherId: string;
  genre?: { id: string; name: string; slug: string };
  author?: { id: string; name: string; slug: string };
  publisher?: { id: string; name: string; slug: string };
}
