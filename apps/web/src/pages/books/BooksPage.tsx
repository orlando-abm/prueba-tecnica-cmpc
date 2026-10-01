import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryStates, parseAsString, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { Search, Plus, X, Download, List, LayoutGrid } from 'lucide-react';
import type { Book } from '@repo/shared/types/book.types';
import { useBooks, useDeleteBook, useRestoreBook, useExportBooks } from '@/hooks/useBooks';
import { useGenres } from '@/hooks/useGenres';
import { useAuthors } from '@/hooks/useAuthors';
import { usePublishers } from '@/hooks/usePublishers';
import { useDebounce } from '@/hooks/useDebounce';
import { useBookStore } from '@/store/bookStore';
import { useBookColumns } from './useBookColumns';
import { BookCard } from './BookCard';
import { BookFormModal } from './BookFormModal';
import { Button, Input, Select, SearchSelect, ConfirmModal } from '@/ui/atoms';
import { Table, Pagination } from '@/ui/organisms';

type ModalState = { open: false } | { open: true; book: Book | null };

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

export default function BooksPage() {
  const navigate = useNavigate();
  const setSelectedBook = useBookStore((s) => s.setSelectedBook);
  const [view, setView] = useState<ViewMode>('grid');
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [confirm, setConfirm] = useState<ConfirmState>({ mode: 'closed' });

  const [filters, setFilters] = useQueryStates({
    q:           parseAsString.withDefault(''),
    page:        parseAsInteger.withDefault(1),
    limit:       parseAsInteger.withDefault(20),
    status:      parseAsStringLiteral(['active', 'inactive', 'all'] as const).withDefault('active'),
    genreId:     parseAsString.withDefault(''),
    authorId:    parseAsString.withDefault(''),
    publisherId: parseAsString.withDefault(''),
    available:   parseAsStringLiteral(['true', 'false', ''] as const).withDefault(''),
    sortBy:      parseAsStringLiteral(['title', 'price', 'stock', 'year', 'createdAt'] as const).withDefault('title'),
    order:       parseAsStringLiteral(['asc', 'desc'] as const).withDefault('asc'),
  }, { history: 'replace', shallow: true });

  const { q: search, page, limit, status, genreId, authorId, publisherId, available, sortBy, order } = filters;

  function setSearch(val: string)           { setFilters({ q: val || null, page: null }); }
  function setPage(val: number)             { setFilters({ page: val > 1 ? val : null }); }
  function setLimit(val: number)            { setFilters({ limit: val !== 20 ? val : null, page: null }); }
  function setStatus(val: StatusFilter)     { setFilters({ status: val !== 'active' ? val : null, page: null }); }
  function setGenreId(val: string)          { setFilters({ genreId: val || null, page: null }); }
  function setAuthorId(val: string)         { setFilters({ authorId: val || null, page: null }); }
  function setPublisherId(val: string)      { setFilters({ publisherId: val || null, page: null }); }
  function setAvailable(val: AvailableFilter) { setFilters({ available: val || null, page: null }); }

  const debouncedSearch = useDebounce(search, 400);

  function handleSort(key: string) {
    const k = key as typeof sortBy;
    if (k === sortBy) setFilters({ order: order === 'asc' ? 'desc' : 'asc', page: null });
    else setFilters({ sortBy: k, order: null, page: null });
  }

  function openBook(book: Book) {
    setSelectedBook(book);
    navigate(`/books/${book.slug}`);
  }

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

  const deleteBook = useDeleteBook();
  const restoreBook = useRestoreBook();
  const exportBooks = useExportBooks();

  const genreOptions = (genresData?.items ?? []).map((g) => ({ value: g.id, label: g.name }));
  const authorOptions = (authorsData?.items ?? []).map((a) => ({ value: a.id, label: a.name }));
  const publisherOptions = (publishersData?.items ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const activeGenreName = genreOptions.find((o) => o.value === genreId)?.label;
  const activeAuthorName = authorOptions.find((o) => o.value === authorId)?.label;
  const activePublisherName = publisherOptions.find((o) => o.value === publisherId)?.label;

  function closeModal() {
    setModal({ open: false });
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
    setFilters({ q: null, page: null, limit: null, status: null, genreId: null, authorId: null, publisherId: null, available: null, sortBy: null, order: null });
  }

  const hasFilters =
    status !== 'active' ||
    debouncedSearch.length >= 3 ||
    !!genreId ||
    !!authorId ||
    !!publisherId ||
    !!available;

  const columns = useBookColumns({
    onEdit: (b) => setModal({ open: true, book: b }),
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
        <Button onClick={() => setModal({ open: true, book: null })}>
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
              onChange={(val) => {
                setGenreId(val);
                setPage(1);
              }}
              onClear={() => {
                setGenreId('');
                setPage(1);
              }}
            />
          </div>

          {/* Author select */}
          <div className="w-36">
            <SearchSelect
              value={authorId}
              options={authorOptions}
              placeholder="Autor"
              onChange={(val) => {
                setAuthorId(val);
                setPage(1);
              }}
              onClear={() => {
                setAuthorId('');
                setPage(1);
              }}
            />
          </div>

          {/* Publisher select */}
          <div className="w-36">
            <SearchSelect
              value={publisherId}
              options={publisherOptions}
              placeholder="Editorial"
              onChange={(val) => {
                setPublisherId(val);
                setPage(1);
              }}
              onClear={() => {
                setPublisherId('');
                setPage(1);
              }}
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
                onRowClick={openBook}
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
                  onOpen={openBook}
                  onEdit={(b) => setModal({ open: true, book: b })}
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
      <BookFormModal open={modal.open} book={modal.open ? modal.book : null} onClose={closeModal} />
    </div>
  );
}
