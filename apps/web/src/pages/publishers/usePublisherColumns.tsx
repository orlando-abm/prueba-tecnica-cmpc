import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import type { Publisher } from '@repo/shared/types/publisher.types';
import { Badge } from '@/ui/atoms';

interface PublisherColumnActions {
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
  onRestore: (publisher: Publisher) => void;
}

export function usePublisherColumns({ onEdit, onDelete, onRestore }: PublisherColumnActions) {
  return [
    {
      key: 'name',
      header: 'Nombre',
      render: (p: Publisher) => <span className="font-medium text-text-primary">{p.name}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'w-32',
      render: (p: Publisher) =>
        p.deletedAt ? (
          <Badge variant="error">Eliminado</Badge>
        ) : (
          <Badge variant="success">Activo</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (p: Publisher) => (
        <div className="flex items-center justify-end gap-1.5">
          {p.deletedAt ? (
            <button
              type="button"
              onClick={() => onRestore(p)}
              title="Activar"
              className="p-1.5 rounded-md text-success bg-success-bg hover:bg-success hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(p)}
                title="Editar"
                className="p-1.5 rounded-md text-text-secondary bg-black/5 hover:bg-black/10 hover:text-text-primary transition-colors cursor-pointer"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p)}
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
