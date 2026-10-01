import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import type { Book } from '@repo/shared/types/book.types';
import { Badge } from '@/ui/atoms';

interface BookColumnActions {
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onRestore: (book: Book) => void;
}

export function useBookColumns({ onEdit, onDelete, onRestore }: BookColumnActions) {
  return [
    {
      key: 'title',
      header: 'Título',
      sortKey: 'title',
      render: (b: Book) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{b.title}</span>
          <span className="text-xs text-text-secondary">{b.author?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'publisher',
      header: 'Editorial',
      render: (b: Book) => <span className="text-text-primary">{b.publisher?.name ?? '—'}</span>,
    },
    {
      key: 'genre',
      header: 'Género',
      className: 'w-32',
      render: (b: Book) =>
        b.genre ? <Badge variant="warning">{b.genre.name}</Badge> : <span>—</span>,
    },
    {
      key: 'price',
      header: 'Precio',
      sortKey: 'price',
      className: 'w-28',
      render: (b: Book) => (
        <span className="font-semibold text-text-primary">
          ${Number(b.price).toLocaleString('es-CL')}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortKey: 'stock',
      className: 'w-20',
      render: (b: Book) => (
        <span className={b.stock === 0 ? 'text-error-text font-semibold' : 'text-text-primary'}>
          {b.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'w-32',
      render: (b: Book) =>
        b.deletedAt ? (
          <Badge variant="purple">Eliminado</Badge>
        ) : b.stock > 0 ? (
          <Badge variant="success">Disponible</Badge>
        ) : (
          <Badge variant="error">Sin stock</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (b: Book) => (
        <div className="flex items-center justify-end gap-1.5">
          {b.deletedAt ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRestore(b);
              }}
              title="Activar"
              className="p-1.5 rounded-md text-success bg-success-bg hover:bg-success hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(b);
                }}
                title="Editar"
                className="p-1.5 rounded-md text-text-secondary bg-black/5 hover:bg-black/10 hover:text-text-primary transition-colors cursor-pointer"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(b);
                }}
                title="Eliminar"
                className="p-1.5 rounded-md text-error bg-error-bg hover:bg-error hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];
}
