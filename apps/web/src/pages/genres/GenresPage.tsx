import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, X } from 'lucide-react';
import { GenreBodySchema, type GenreBodyDto } from '@repo/shared/schemas/genre.schema';
import type { Genre } from '@repo/shared/types/genre.types';
import {
  useGenres,
  useCreateGenre,
  useUpdateGenre,
  useDeleteGenre,
  useRestoreGenre,
} from '@/hooks/useGenres';
import { useDebounce } from '@/hooks/useDebounce';
import { useGenreColumns } from './useGenreColumns';
import { Button, Input, Modal, Select, ConfirmModal } from '@/ui/atoms';
import { Table, Pagination } from '@/ui/organisms';
import { ApiError } from '@/lib/http';
import { useToastStore } from '@/store/toast.store';

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; genre: Genre };

type ConfirmState =
  | { mode: 'closed' }
  | { mode: 'delete'; genre: Genre }
  | { mode: 'restore'; genre: Genre };

type StatusFilter = 'active' | 'inactive' | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Eliminados' },
  { value: 'all', label: 'Todos' },
];

export default function GenresPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<StatusFilter>('active');
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [confirm, setConfirm] = useState<ConfirmState>({ mode: 'closed' });
  const toast = useToastStore((s) => s.toast);

  const debouncedSearch = useDebounce(search, 400);
  const activeSearch = debouncedSearch.length >= 3 ? debouncedSearch : undefined;

  const { data, isLoading } = useGenres({ search: activeSearch, page, limit, status });
  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deleteGenre = useDeleteGenre();
  const restoreGenre = useRestoreGenre();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<GenreBodyDto>({
    resolver: zodResolver(GenreBodySchema),
  });

  function openCreate() {
    reset({ name: '' });
    setModal({ mode: 'create' });
  }

  function openEdit(genre: Genre) {
    reset({ name: genre.name });
    setModal({ mode: 'edit', genre });
  }

  function closeModal() {
    setModal({ mode: 'closed' });
    reset();
  }

  async function onSubmit(dto: GenreBodyDto) {
    try {
      if (modal.mode === 'create') {
        await createGenre.mutateAsync(dto);
        toast('success', 'Género creado correctamente');
      } else if (modal.mode === 'edit') {
        await updateGenre.mutateAsync({ id: modal.genre.id, dto });
        toast('success', 'Género actualizado correctamente');
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
        await deleteGenre.mutateAsync(confirm.genre.id);
        toast('success', 'Género eliminado');
      } else if (confirm.mode === 'restore') {
        await restoreGenre.mutateAsync(confirm.genre.id);
        toast('success', 'Género activado');
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

  const columns = useGenreColumns({
    onEdit: openEdit,
    onDelete: (g) => setConfirm({ mode: 'delete', genre: g }),
    onRestore: (g) => setConfirm({ mode: 'restore', genre: g }),
  });

  return (
    <div className="p-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Géneros</h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            {data ? `${data.total} géneros` : ' '}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Nuevo género
        </Button>
      </div>

      {/* Toolbar + tabla — mismo gap interno que entre search y chips */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Search pill */}
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Buscar género..."
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
              emptyMessage="No se encontraron géneros."
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
            itemLabel="géneros"
          />
        )}
      </div>

      {/* Confirm delete / restore */}
      <ConfirmModal
        open={confirm.mode !== 'closed'}
        title={confirm.mode === 'delete' ? 'Eliminar género' : 'Activar género'}
        description={
          confirm.mode === 'delete'
            ? `¿Estás seguro que quieres eliminar "${confirm.genre.name}"? Esta acción se puede revertir.`
            : confirm.mode === 'restore'
              ? `¿Quieres activar "${confirm.genre.name}"?`
              : ''
        }
        confirmLabel={confirm.mode === 'delete' ? 'Sí, eliminar' : 'Sí, activar'}
        variant={confirm.mode === 'delete' ? 'destructive' : 'success'}
        loading={deleteGenre.isPending || restoreGenre.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ mode: 'closed' })}
      />

      {/* Modal crear / editar */}
      <Modal
        open={modal.mode !== 'closed'}
        title={modal.mode === 'create' ? 'Nuevo género' : 'Editar género'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            placeholder="Ej. Ciencia Ficción"
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
