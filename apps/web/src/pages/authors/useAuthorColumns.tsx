import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import type { Author } from '@repo/shared/types/author.types'
import { Badge } from '@/ui/atoms'

interface AuthorColumnActions {
  onEdit:    (author: Author) => void
  onDelete:  (author: Author) => void
  onRestore: (author: Author) => void
}

export function useAuthorColumns({ onEdit, onDelete, onRestore }: AuthorColumnActions) {
  return [
    {
      key: 'name',
      header: 'Nombre',
      render: (a: Author) => <span className="font-medium text-text-primary">{a.name}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'w-32',
      render: (a: Author) =>
        a.deletedAt
          ? <Badge variant="error">Eliminado</Badge>
          : <Badge variant="success">Activo</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (a: Author) => (
        <div className="flex items-center justify-end gap-1.5">
          {a.deletedAt ? (
            <button
              onClick={() => onRestore(a)}
              title="Activar"
              className="p-1.5 rounded-md text-success bg-success-bg hover:bg-success hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(a)}
                title="Editar"
                className="p-1.5 rounded-md text-text-secondary bg-black/5 hover:bg-black/10 hover:text-text-primary transition-colors cursor-pointer"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(a)}
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
  ]
}
