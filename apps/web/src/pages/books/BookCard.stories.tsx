import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { BookCard } from './BookCard';
import type { Book } from '@repo/shared/types/book.types';

const baseBook: Book = {
  id: 'book-1',
  title: 'Cien años de soledad',
  slug: 'cien-anos-de-soledad',
  price: '14990',
  stock: 8,
  deletedAt: null,
  imageUrl: null,
  isbn: '978-0-06-088328-7',
  sku: 'LIB-001',
  synopsis: 'La historia de la familia Buendía a lo largo de siete generaciones en el pueblo mítico de Macondo.',
  language: 'Español',
  pages: 432,
  year: 1967,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  genreId: 'g1',
  authorId: 'a1',
  publisherId: 'p1',
  genre: { id: 'g1', name: 'Realismo mágico', slug: 'realismo-magico' },
  author: { id: 'a1', name: 'Gabriel García Márquez', slug: 'gabriel-garcia-marquez' },
  publisher: { id: 'p1', name: 'Editorial Sudamericana', slug: 'editorial-sudamericana' },
};

const meta: Meta<typeof BookCard> = {
  title: 'Books/BookCard',
  component: BookCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  args: {
    onOpen: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onRestore: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BookCard>;

export const Disponible: Story = {
  args: { book: baseBook },
};

export const SinStock: Story = {
  args: {
    book: { ...baseBook, stock: 0 },
  },
};

export const Eliminado: Story = {
  args: {
    book: { ...baseBook, deletedAt: new Date().toISOString() },
  },
};

export const ConImagen: Story = {
  args: {
    book: {
      ...baseBook,
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780060888282-M.jpg',
    },
  },
};

export const TituloLargo: Story = {
  args: {
    book: {
      ...baseBook,
      title: 'El señor de los anillos: La comunidad del anillo — Edición especial ilustrada',
    },
  },
};
