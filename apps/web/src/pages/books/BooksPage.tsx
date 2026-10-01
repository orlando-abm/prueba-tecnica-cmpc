import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, X, Download, List, LayoutGrid } from 'lucide-react';
import { BookBodySchema, type BookBodyDto } from '@repo/shared/schemas/book.schema';
import type { Book } from '@repo/shared/types/book.types';
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useRestoreBook,
  useExportBooks,
} from '@/hooks/useBooks';
import { useGenres, useCreateGenre } from '@/hooks/useGenres';
import { useAuthors, useCreateAuthor } from '@/hooks/useAuthors';
import { usePublishers, useCreatePublisher } from '@/hooks/usePublishers';
import { useDebounce } from '@/hooks/useDebounce';
import { useBookColumns } from './useBookColumns';
import { BookCard } from './BookCard';
import { ImageDropzone } from './ImageDropzone';
import { uploadService } from '@/services/upload.service';
import { Button, Input, Modal, Select, SearchSelect, ConfirmModal } from '@/ui/atoms';
import { Table, Pagination } from '@/ui/organisms';
import { ApiError } from '@/lib/http';

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; book: Book };

type ConfirmState =
  | { mode: 'closed' }
  | { mode: 'delete'; book: Book }
  | { mode: 'restore'; book: Book };

type StatusFilter = 'active' | 'inactive' | 'all';
type ViewMode = 'table' | 'grid';
type AvailableFilter = 'true' | 'false' | '';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Eliminados' },
  { value: 'all', label: 'Todos' },
];

const AVAILABLE_OPTIONS: { value: AvailableFilter; label: string }[] = [
  { value: '', label: 'Disponibilidad' },
  { value: 'true', label: 'Disponibles' },
  { value: 'false', label: 'Sin stock' },
];

const emptyToUndefined = (v: string) => (v === '' || v == null ? undefined : v);
const numberOrUndefined = (v: string) => {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export default function BooksPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<StatusFilter>('active');
  const [view, setView] = useState<ViewMode>('grid');
  const [genreId, setGenreId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [available, setAvailable] = useState<AvailableFilter>('');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'stock' | 'year' | 'createdAt'>('title');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [confirm, setConfirm] = useState<ConfirmState>({ mode: 'closed' });
  const [uploading, setUploading] = useState(false);

  function handleSort(key: string) {
    const k = key as typeof sortBy;
    if (k === sortBy) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(k); setOrder('asc'); }
    setPage(1);
  }

  const debouncedSearch = useDebounce(search, 400);
  const activeSearch = debouncedSearch.length >= 3 ? debouncedSearch : undefined;

  const { data: genresData } = useGenres({ status: 'active', limit: 100 });
  const { data: authorsData } = useAuthors({ status: 'active', limit: 100 });
  const { data: publishersData } = usePublishers({ status: 'active', limit: 100 });

  const { data, isLoading } = useBooks({
    search: activeSearch,
    page,
    limit,
    status,
    genreId: genreId || undefined,
    authorId: authorId || undefined,
    publisherId: publisherId || undefined,
    available: available || undefined,
    sortBy,
    order,
    include: ['genre', 'author', 'publisher'],
  });

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  const restoreBook = useRestoreBook();
  const exportBooks = useExportBooks();
  const createGenre = useCreateGenre();
  const createAuthor = useCreateAuthor();
  const createPublisher = useCreatePublisher();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(BookBodySchema),
  });

  const formGenreId = watch('genreId');
  const formAuthorId = watch('authorId');
  const formPublisherId = watch('publisherId');
  const formImageUrl = watch('imageUrl');

  const genreOptions = (genresData?.items ?? []).map((g) => ({ value: g.id, label: g.name }));
  const authorOptions = (authorsData?.items ?? []).map((a) => ({ value: a.id, label: a.name }));
  const publisherOptions = (publishersData?.items ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const activeGenreName = genreOptions.find((o) => o.value === genreId)?.label;
  const activeAuthorName = authorOptions.find((o) => o.value === authorId)?.label;
  const activePublisherName = publisherOptions.find((o) => o.value === publisherId)?.label;

  function openCreate() {
    reset({ title: '', isbn: '', sku: '', synopsis: '', language: '', imageUrl: '' });
    setModal({ mode: 'create' });
  }

  function openEdit(book: Book) {
    reset({
      title: book.title,
      authorId: book.authorId,
      publisherId: book.publisherId,
      genreId: book.genreId,
      price: Number(book.price),
      stock: book.stock,
      isbn: book.isbn ?? '',
      sku: book.sku ?? '',
      language: book.language ?? '',
      year: book.year ?? undefined,
      pages: book.pages ?? undefined,
      synopsis: book.synopsis ?? '',
      imageUrl: book.imageUrl ?? '',
    });
    setModal({ mode: 'edit', book });
  }

  function closeModal() {
    setModal({ mode: 'closed' });
    reset();
  }

  async function onSubmit(dto: BookBodyDto) {
    try {
      if (modal.mode === 'create') await createBook.mutateAsync(dto);
      else if (modal.mode === 'edit') await updateBook.mutateAsync({ id: modal.book.id, dto });
      closeModal();
    } catch (err) {
      if (err instanceof ApiError) {
        const message = err.error.message;
        switch (err.error.code) {
          case 'BOOK_002':
          case 'BOOK_006':
            setError('isbn', { message });
            break;
          case 'BOOK_003':
          case 'BOOK_007':
            setError('sku', { message });
            break;
          case 'BOOK_008':
            setError('genreId', { message });
            break;
          case 'BOOK_009':
            setError('authorId', { message });
            break;
          case 'BOOK_010':
            setError('publisherId', { message });
            break;
          default:
            setError('title', { message });
        }
      }
    }
  }

  async function processImageFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadService.image(file);
      setValue('imageUrl', url, { shouldValidate: true });
    } catch (err) {
      setError('imageUrl', {
        message: err instanceof ApiError ? err.error.message : 'No se pudo subir la imagen',
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirm() {
    try {
      if (confirm.mode === 'delete') {
        await deleteBook.mutateAsync(confirm.book.id);
      } else if (confirm.mode === 'restore') {
        await restoreBook.mutateAsync(confirm.book.id);
      }
    } finally {
      setConfirm({ mode: 'closed' });
    }
  }

  function handleExport() {
    exportBooks.mutate({
      search: activeSearch,
      status,
      genreId: genreId || undefined,
      authorId: authorId || undefined,
      publisherId: publisherId || undefined,
      available: available || undefined,
    });
  }

  function clearFilters() {
    setStatus('active');
    setSearch('');
    setPage(1);
    setLimit(20);
    setGenreId('');
    setAuthorId('');
    setPublisherId('');
    setAvailable('');
  }

  const hasFilters =
    status !== 'active' ||
    debouncedSearch.length >= 3 ||
    !!genreId ||
    !!authorId ||
    !!publisherId ||
    !!available;

  const columns = useBookColumns({
    onEdit: openEdit,
    onDelete: (b) => setConfirm({ mode: 'delete', book: b }),
    onRestore: (b) => setConfirm({ mode: 'restore', book: b }),
  });

  return (
    <div className="p-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Libros</h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            {data ? `${data.total} libros` : ' '}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Nuevo libro
        </Button>
      </div>

      {/* Toolbar + contenido */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search pill */}
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Buscar libro..."
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

          {/* Genre select */}
          <div className="w-36">
            <SearchSelect
              value={genreId}
              options={genreOptions}
              placeholder="Género"
              onChange={(val) => { setGenreId(val); setPage(1); }}
              onClear={() => { setGenreId(''); setPage(1); }}
            />
          </div>

          {/* Author select */}
          <div className="w-36">
            <SearchSelect
              value={authorId}
              options={authorOptions}
              placeholder="Autor"
              onChange={(val) => { setAuthorId(val); setPage(1); }}
              onClear={() => { setAuthorId(''); setPage(1); }}
            />
          </div>

          {/* Publisher select */}
          <div className="w-36">
            <SearchSelect
              value={publisherId}
              options={publisherOptions}
              placeholder="Editorial"
              onChange={(val) => { setPublisherId(val); setPage(1); }}
              onClear={() => { setPublisherId(''); setPage(1); }}
            />
          </div>

          {/* Availability select */}
          <div className="w-36">
            <Select
              value={available}
              options={AVAILABLE_OPTIONS}
              onChange={(val) => {
                setAvailable(val as AvailableFilter);
                setPage(1);
              }}
            />
          </div>

          {/* CSV export */}
          <Button variant="secondary" onClick={handleExport} disabled={exportBooks.isPending}>
            <Download size={16} className="mr-2" />
            CSV
          </Button>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border-[1.5px] border-border-light bg-surface-light p-0.5 ml-auto">
            <button
              type="button"
              onClick={() => setView('table')}
              title="Vista tabla"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                view === 'table'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary bg-bg-light hover:text-text-primary'
              }`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              title="Vista grilla"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                view === 'grid'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary bg-bg-light hover:text-text-primary'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
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
            {genreId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-bg border border-warning-text/20 text-xs font-semibold font-sans text-warning-text">
                {activeGenreName}
                <button
                  type="button"
                  onClick={() => {
                    setGenreId('');
                    setPage(1);
                  }}
                  className="cursor-pointer hover:opacity-70"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {authorId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info-bg border border-info/20 text-xs font-semibold font-sans text-info-text">
                {activeAuthorName}
                <button
                  type="button"
                  onClick={() => {
                    setAuthorId('');
                    setPage(1);
                  }}
                  className="cursor-pointer hover:opacity-70"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {publisherId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info-bg border border-info/20 text-xs font-semibold font-sans text-info-text">
                {activePublisherName}
                <button
                  type="button"
                  onClick={() => {
                    setPublisherId('');
                    setPage(1);
                  }}
                  className="cursor-pointer hover:opacity-70"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {available && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-bg border border-success-text/20 text-xs font-semibold font-sans text-success-text">
                {AVAILABLE_OPTIONS.find((o) => o.value === available)?.label}
                <button
                  type="button"
                  onClick={() => {
                    setAvailable('');
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

        {/* Table view */}
        {view === 'table' ? (
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
                emptyMessage="No se encontraron libros."
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
              />
            )}
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-border-light animate-pulse" />
              ))
            ) : (data?.items.length ?? 0) === 0 ? (
              <div className="col-span-full py-16 text-center text-text-secondary font-sans text-sm">
                No se encontraron libros.
              </div>
            ) : (
              (data?.items ?? []).map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={openEdit}
                  onDelete={(b) => setConfirm({ mode: 'delete', book: b })}
                  onRestore={(b) => setConfirm({ mode: 'restore', book: b })}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            itemLabel="libros"
          />
        )}
      </div>

      {/* Confirm delete / restore */}
      <ConfirmModal
        open={confirm.mode !== 'closed'}
        title={confirm.mode === 'delete' ? 'Eliminar libro' : 'Activar libro'}
        description={
          confirm.mode === 'delete'
            ? `¿Estás seguro que quieres eliminar "${confirm.book.title}"? Esta acción se puede revertir.`
            : confirm.mode === 'restore'
              ? `¿Quieres activar "${confirm.book.title}"?`
              : ''
        }
        confirmLabel={confirm.mode === 'delete' ? 'Sí, eliminar' : 'Sí, activar'}
        variant={confirm.mode === 'delete' ? 'destructive' : 'success'}
        loading={deleteBook.isPending || restoreBook.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ mode: 'closed' })}
      />

      {/* Modal crear / editar */}
      <Modal
        open={modal.mode !== 'closed'}
        title={modal.mode === 'create' ? 'Nuevo libro' : 'Editar libro'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Título"
            placeholder="Ej. Cien años de soledad"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-2 gap-3">
            <SearchSelect
              label="Autor"
              value={formAuthorId}
              options={authorOptions}
              placeholder="Seleccionar autor"
              error={errors.authorId?.message}
              adding={createAuthor.isPending}
              onChange={(val) =>
                setValue('authorId', val, { shouldValidate: true, shouldDirty: true })
              }
              onAdd={async (name) => {
                if (!name) return;
                const created = await createAuthor.mutateAsync({ name });
                setValue('authorId', created.id, { shouldValidate: true, shouldDirty: true });
              }}
            />
            <SearchSelect
              label="Editorial"
              value={formPublisherId}
              options={publisherOptions}
              placeholder="Seleccionar editorial"
              error={errors.publisherId?.message}
              adding={createPublisher.isPending}
              onChange={(val) =>
                setValue('publisherId', val, { shouldValidate: true, shouldDirty: true })
              }
              onAdd={async (name) => {
                if (!name) return;
                const created = await createPublisher.mutateAsync({ name });
                setValue('publisherId', created.id, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SearchSelect
              label="Género"
              value={formGenreId}
              options={genreOptions}
              placeholder="Seleccionar género"
              error={errors.genreId?.message}
              adding={createGenre.isPending}
              onChange={(val) =>
                setValue('genreId', val, { shouldValidate: true, shouldDirty: true })
              }
              onAdd={async (name) => {
                if (!name) return;
                const created = await createGenre.mutateAsync({ name });
                setValue('genreId', created.id, { shouldValidate: true, shouldDirty: true });
              }}
            />
            <Input
              label="Precio"
              inputMode="numeric"
              placeholder="0"
              error={errors.price?.message}
              {...register('price')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Stock"
              inputMode="numeric"
              placeholder="0"
              error={errors.stock?.message}
              {...register('stock')}
            />
            <Input
              label="Año"
              inputMode="numeric"
              placeholder="Opcional"
              error={errors.year?.message}
              {...register('year', { setValueAs: numberOrUndefined })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Páginas"
              inputMode="numeric"
              placeholder="Opcional"
              error={errors.pages?.message}
              {...register('pages', { setValueAs: numberOrUndefined })}
            />
            <Input
              label="Idioma"
              placeholder="Opcional"
              error={errors.language?.message}
              {...register('language', { setValueAs: emptyToUndefined })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ISBN"
              placeholder="Opcional"
              error={errors.isbn?.message}
              {...register('isbn', { setValueAs: emptyToUndefined })}
            />
            <Input
              label="SKU"
              placeholder="Opcional"
              error={errors.sku?.message}
              {...register('sku', { setValueAs: emptyToUndefined })}
            />
          </div>

          <ImageDropzone
            value={formImageUrl}
            uploading={uploading}
            error={errors.imageUrl?.message}
            onFile={processImageFile}
            onClear={() => setValue('imageUrl', '', { shouldValidate: true })}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label
              htmlFor="synopsis"
              className="text-text-primary font-sans text-[13px] font-medium"
            >
              Sinopsis
            </label>
            <textarea
              id="synopsis"
              rows={3}
              placeholder="Opcional"
              className={`w-full rounded-lg border-[1.5px] bg-surface-light px-3.5 py-2.5 text-sm font-sans text-text-primary placeholder:text-text-secondary-dark outline-none focus:outline-none focus-visible:outline-none transition-colors border-border-light focus:border-accent focus:border-2 ${
                errors.synopsis?.message ? 'border-error' : ''
              }`}
              {...register('synopsis', { setValueAs: emptyToUndefined })}
            />
            {errors.synopsis?.message && (
              <span className="text-error-text font-sans text-xs">{errors.synopsis.message}</span>
            )}
          </div>

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
