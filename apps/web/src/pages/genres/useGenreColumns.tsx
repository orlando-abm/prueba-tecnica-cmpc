import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import type { Genre } from '@repo/shared/types/genre.types'
import { Badge } from '@/ui/atoms'

interface GenreColumnActions {
  onEdit:    (genre: Genre) => void
  onDelete:  (genre: Genre) => void
  onRestore: (genre: Genre) => void
}

export function useGenreColumns({ onEdit, onDelete, onRestore }: GenreColumnActions) {
  return [
    {
      key: 'name',
      header: 'Nombre',
      render: (g: Genre) => <span className="font-medium text-text-primary">{g.name}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'w-32',
      render: (g: Genre) =>
        g.deletedAt
          ? <Badge variant="error">Eliminado</Badge>
          : <Badge variant="success">Activo</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (g: Genre) => (
        <div className="flex items-center justify-end gap-1.5">
          {g.deletedAt ? (
            <button
              onClick={() => onRestore(g)}
              title="Activar"
              className="p-1.5 rounded-md text-success bg-success-bg hover:bg-success hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(g)}
                title="Editar"
                className="p-1.5 rounded-md text-text-secondary bg-black/5 hover:bg-black/10 hover:text-text-primary transition-colors cursor-pointer"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(g)}
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
