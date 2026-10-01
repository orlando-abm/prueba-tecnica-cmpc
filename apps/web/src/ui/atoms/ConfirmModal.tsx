import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'success'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'destructive',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="font-sans text-sm text-text-secondary leading-relaxed">{description}</p>
      <div className="flex gap-3 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Cargando...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
