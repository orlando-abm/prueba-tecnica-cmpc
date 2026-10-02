import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BookCard } from './BookCard';
import type { Book } from '@repo/shared/types/book.types';

vi.mock('./BookCover', () => ({
  BookCover: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const mockBook = (overrides: Partial<Book> = {}): Book =>
  ({
    id: 'book-1',
    title: 'El Principito',
    slug: 'el-principito',
    price: '9990',
    stock: 5,
    deletedAt: null,
    imageUrl: null,
    isbn: null,
    sku: null,
    synopsis: null,
    language: null,
    pages: null,
    year: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    genreId: 'g1',
    authorId: 'a1',
    publisherId: 'p1',
    genre: { id: 'g1', name: 'Ficción', slug: 'ficcion' },
    author: { id: 'a1', name: 'Antoine de Saint-Exupéry', slug: 'antoine' },
    publisher: { id: 'p1', name: 'Editorial X', slug: 'ed-x' },
    ...overrides,
  } as Book);

const defaultProps = {
  onOpen: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onRestore: vi.fn(),
};

// helper: acota la búsqueda a los botones <button> reales (excluye el div role=button)
const getButtons = () =>
  screen.getAllByRole('button').filter((el) => el.tagName === 'BUTTON');

describe('BookCard', () => {
  it('muestra título, autor y precio del libro', () => {
    render(<BookCard book={mockBook()} {...defaultProps} />);
    expect(screen.getByText('El Principito')).toBeInTheDocument();
    expect(screen.getByText('Antoine de Saint-Exupéry')).toBeInTheDocument();
    expect(screen.getByText(/9\.990/)).toBeInTheDocument();
  });

  it('muestra badge "Disponible" cuando hay stock y no está eliminado', () => {
    render(<BookCard book={mockBook({ stock: 3, deletedAt: null })} {...defaultProps} />);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('muestra badge "Sin stock" cuando stock es 0', () => {
    render(<BookCard book={mockBook({ stock: 0, deletedAt: null })} {...defaultProps} />);
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('muestra badge "Eliminado" y botón Restaurar cuando está eliminado', () => {
    render(<BookCard book={mockBook({ deletedAt: new Date().toISOString() })} {...defaultProps} />);
    expect(screen.getByText('Eliminado')).toBeInTheDocument();
    const btns = getButtons();
    expect(btns.some((b) => /restaurar/i.test(b.textContent ?? ''))).toBe(true);
  });

  it('muestra botones Editar y Eliminar cuando no está eliminado', () => {
    render(<BookCard book={mockBook()} {...defaultProps} />);
    const btns = getButtons();
    expect(btns.some((b) => /editar/i.test(b.textContent ?? ''))).toBe(true);
    expect(btns.some((b) => /eliminar/i.test(b.textContent ?? ''))).toBe(true);
  });

  it('llama onOpen al hacer click en la card', async () => {
    const onOpen = vi.fn();
    render(<BookCard book={mockBook()} {...defaultProps} onOpen={onOpen} />);
    await userEvent.click(screen.getByText('El Principito'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'book-1' }));
  });

  it('llama onEdit sin propagar al padre', async () => {
    const onEdit = vi.fn();
    const onOpen = vi.fn();
    render(<BookCard book={mockBook()} {...defaultProps} onEdit={onEdit} onOpen={onOpen} />);
    const editBtn = getButtons().find((b) => /editar/i.test(b.textContent ?? ''))!;
    await userEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('llama onDelete sin propagar al padre', async () => {
    const onDelete = vi.fn();
    const onOpen = vi.fn();
    render(<BookCard book={mockBook()} {...defaultProps} onDelete={onDelete} onOpen={onOpen} />);
    const deleteBtn = getButtons().find((b) => /eliminar/i.test(b.textContent ?? ''))!;
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('llama onRestore en libro eliminado sin propagar', async () => {
    const onRestore = vi.fn();
    const onOpen = vi.fn();
    render(
      <BookCard
        book={mockBook({ deletedAt: new Date().toISOString() })}
        {...defaultProps}
        onRestore={onRestore}
        onOpen={onOpen}
      />,
    );
    const restoreBtn = getButtons().find((b) => /restaurar/i.test(b.textContent ?? ''))!;
    await userEvent.click(restoreBtn);
    expect(onRestore).toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('muestra el género del libro', () => {
    render(<BookCard book={mockBook()} {...defaultProps} />);
    expect(screen.getByText('Ficción')).toBeInTheDocument();
  });
});
