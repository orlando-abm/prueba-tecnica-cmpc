import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import type { Book } from '@repo/shared/types/book.types';
import { Badge } from '@/ui/atoms';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onRestore: (book: Book) => void;
}

export function BookCard({ book, onEdit, onDelete, onRestore }: BookCardProps) {
  const isDeleted = !!book.deletedAt;
  const isAvailable = !book.deletedAt && book.stock > 0;

  return (
    <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden flex flex-col">
      <div className="h-40 shrink-0">
        <BookCover src={book.imageUrl} alt={book.title} />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {book.genre && (
          <span className="self-start">
            <Badge variant="warning">{book.genre.name}</Badge>
          </span>
        )}

        <h3 className="font-serif font-semibold text-text-primary leading-snug line-clamp-2">
          {book.title}
        </h3>

        <p className="font-sans text-sm text-text-secondary truncate">{book.author?.name ?? '—'}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-sans text-sm font-bold text-text-primary">
            ${Number(book.price).toLocaleString('es-CL')}
          </span>
          {isDeleted ? (
            <Badge variant="purple">Eliminado</Badge>
          ) : isAvailable ? (
            <Badge variant="success">Disponible</Badge>
          ) : (
            <Badge variant="error">Sin stock</Badge>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          {isDeleted ? (
            <button
              type="button"
              onClick={() => onRestore(book)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold font-sans bg-success text-white hover:opacity-90 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              Restaurar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold font-sans text-text-secondary bg-black/5 hover:bg-black/10 hover:text-text-primary transition-colors cursor-pointer"
              >
                <Pencil size={13} />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold font-sans bg-error text-white hover:opacity-90 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
