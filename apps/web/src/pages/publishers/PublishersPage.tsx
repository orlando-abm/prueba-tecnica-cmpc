import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, X } from 'lucide-react';
import { PublisherBodySchema, type PublisherBodyDto } from '@repo/shared/schemas/publisher.schema';
import type { Publisher } from '@repo/shared/types/publisher.types';
import {
  usePublishers,
  useCreatePublisher,
  useUpdatePublisher,
  useDeletePublisher,
  useRestorePublisher,
} from '@/hooks/usePublishers';
import { useDebounce } from '@/hooks/useDebounce';
import { usePublisherColumns } from './usePublisherColumns';
import { Button, Input, Modal, Select, ConfirmModal } from '@/ui/atoms';
import { Table, Pagination } from '@/ui/organisms';
import { ApiError } from '@/lib/http';
import { useToastStore } from '@/store/toast.store';

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; publisher: Publisher };

type ConfirmState =
  | { mode: 'closed' }
  | { mode: 'delete'; publisher: Publisher }
  | { mode: 'restore'; publisher: Publisher };

type StatusFilter = 'active' | 'inactive' | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Eliminados' },
  { value: 'all', label: 'Todos' },
];

export default function PublishersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<StatusFilter>('active');
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [confirm, setConfirm] = useState<ConfirmState>({ mode: 'closed' });
  const toast = useToastStore((s) => s.toast);

  const debouncedSearch = useDebounce(search, 400);
  const activeSearch = debouncedSearch.length >= 3 ? debouncedSearch : undefined;

  const { data, isLoading } = usePublishers({ search: activeSearch, page, limit, status });
  const createPublisher = useCreatePublisher();
  const updatePublisher = useUpdatePublisher();
  const deletePublisher = useDeletePublisher();
  const restorePublisher = useRestorePublisher();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<PublisherBodyDto>({
    resolver: zodResolver(PublisherBodySchema),
  });

  function openCreate() {
    reset({ name: '' });
    setModal({ mode: 'create' });
  }

  function openEdit(publisher: Publisher) {
    reset({ name: publisher.name });
    setModal({ mode: 'edit', publisher });
  }

  function closeModal() {
    setModal({ mode: 'closed' });
    reset();
  }

  async function onSubmit(dto: PublisherBodyDto) {
    try {
      if (modal.mode === 'create') {
        await createPublisher.mutateAsync(dto);
        toast('success', 'Editorial creada correctamente');
      } else if (modal.mode === 'edit') {
        await updatePublisher.mutateAsync({ id: modal.publisher.id, dto });
        toast('success', 'Editorial actualizada correctamente');
      }
      closeModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setError('name', { message: err.error.message });
        toast('error', err.error.message);
      }
    }
  }

  async function handleConfirm() {
    try {
      if (confirm.mode === 'delete') {
        await deletePublisher.mutateAsync(confirm.publisher.id);
        toast('success', 'Editorial eliminada');
      } else if (confirm.mode === 'restore') {
        await restorePublisher.mutateAsync(confirm.publisher.id);
        toast('success', 'Editorial activada');
      }
    } catch (err) {
      toast('error', err instanceof ApiError ? err.error.message : 'Ocurrió un error inesperado');
    } finally {
      setConfirm({ mode: 'closed' });
    }
  }

  function clearFilters() {
    setStatus('active');
    setSearch('');
    setPage(1);
    setLimit(20);
  }

  const hasFilters = status !== 'active' || debouncedSearch.length >= 3;

  const columns = usePublisherColumns({
    onEdit: openEdit,
    onDelete: (p) => setConfirm({ mode: 'delete', publisher: p }),
    onRestore: (p) => setConfirm({ mode: 'restore', publisher: p }),
  });

  return (
    <div className="p-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Editoriales</h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            {data ? `${data.total} editoriales` : ' '}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Nueva editorial
        </Button>
      </div>

      {/* Toolbar + tabla */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Search pill */}
          <div className="flex-1">
            <Input
              placeholder="Buscar editorial..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              startIcon={<Search size={15} />}
              endIcon={
                search.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <X size={14} />
                  </button>
                ) : undefined
              }
              className="rounded-full"
            />
          </div>

          {/* Status select */}
          <div className="w-40">
            <Select
              value={status}
              options={STATUS_OPTIONS}
              onChange={(val) => {
                setStatus(val as StatusFilter);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {status !== 'active' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-bg border border-purple-text/20 text-xs font-semibold font-sans text-purple-text">
                {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                <button
                  type="button"
                  onClick={() => {
                    setStatus('active');
                    setPage(1);
                  }}
                  className="cursor-pointer hover:opacity-70"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {debouncedSearch.length >= 3 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info-bg border border-info/20 text-xs font-semibold font-sans text-info-text">
                "{debouncedSearch}"
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="cursor-pointer hover:opacity-70"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-sans text-text-secondary hover:text-text-primary underline cursor-pointer transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        )}
        {/* Table */}
        <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-text-secondary font-sans text-sm">
              Cargando...
            </div>
          ) : (
            <Table
              columns={columns}
              data={data?.items ?? []}
              keyField="id"
              emptyMessage="No se encontraron editoriales."
            />
          )}
        </div>

        {/* Pagination */}
        {data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            itemLabel="editoriales"
          />
        )}
      </div>

      {/* Confirm delete / restore */}
      <ConfirmModal
        open={confirm.mode !== 'closed'}
        title={confirm.mode === 'delete' ? 'Eliminar editorial' : 'Activar editorial'}
        description={
          confirm.mode === 'delete'
            ? `¿Estás seguro que quieres eliminar "${confirm.publisher.name}"? Esta acción se puede revertir.`
            : confirm.mode === 'restore'
              ? `¿Quieres activar "${confirm.publisher.name}"?`
              : ''
        }
        confirmLabel={confirm.mode === 'delete' ? 'Sí, eliminar' : 'Sí, activar'}
        variant={confirm.mode === 'delete' ? 'destructive' : 'success'}
        loading={deletePublisher.isPending || restorePublisher.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ mode: 'closed' })}
      />

      {/* Modal crear / editar */}
      <Modal
        open={modal.mode !== 'closed'}
        title={modal.mode === 'create' ? 'Nueva editorial' : 'Editar editorial'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            placeholder="Ej. Penguin Random House"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {modal.mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
