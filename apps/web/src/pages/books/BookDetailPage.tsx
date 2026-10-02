import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Quote, Trash2, RotateCcw } from 'lucide-react';
import type { Book } from '@repo/shared/types/book.types';
import { useBookDetail, BOOK_DETAIL_KEY } from '@/hooks/useBookDetail';
import { useBooks, useDeleteBook, useRestoreBook } from '@/hooks/useBooks';
import { useBookStore } from '@/store/bookStore';
import { ApiError } from '@/lib/http';
import { useToastStore } from '@/store/toast.store';
import { Badge, ConfirmModal } from '@/ui/atoms';
import { BookCover } from './BookCover';
import { BookFormModal } from './BookFormModal';

function formatPrice(price: string | number) {
  return `$${Number(price).toLocaleString('es-CL')}`;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="h-14 border-b border-border-light bg-surface-light animate-pulse" />
      <div className="p-8 flex flex-col gap-8">
        <div className="flex gap-8">
          <div className="w-[168px] h-[236px] rounded-xl bg-border-light animate-pulse shrink-0" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-8 w-2/3 rounded bg-border-light animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-border-light animate-pulse" />
            <div className="h-6 w-40 rounded-full bg-border-light animate-pulse" />
            <div className="h-16 w-full rounded bg-border-light animate-pulse" />
          </div>
        </div>
        <div className="h-24 w-full rounded bg-border-light animate-pulse" />
      </div>
    </div>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32">
      <div className="w-16 h-16 rounded-full bg-warning-bg flex items-center justify-center">
        <BookOpen size={28} className="text-warning-text" />
      </div>
      <h2 className="font-serif text-xl font-bold text-text-primary">Libro no encontrado</h2>
      <p className="font-sans text-sm text-text-secondary">
        El libro que buscas no existe o fue eliminado.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold font-sans bg-text-primary text-white hover:opacity-90 transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} />
        Volver a libros
      </button>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-[11px] uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      <span className="font-sans text-sm font-bold text-text-primary">{value}</span>
    </div>
  );
}

function TopBar({
  book,
  onEdit,
  onDelete,
  onRestore,
  onBack,
}: {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onBack: () => void;
}) {
  const isDeleted = !!book.deletedAt;

  return (
    <div className="flex items-center justify-between h-14 px-8 border-b border-border-light bg-surface-light shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors cursor-pointer"
          title="Volver"
        >
          <ArrowLeft size={16} />
        </button>
        <Link
          to="/books"
          className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors shrink-0"
        >
          Libros
        </Link>
        <span className="font-sans text-sm text-text-secondary">/</span>
        <span className="font-sans text-sm font-medium text-text-primary truncate">
          {book.title}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isDeleted && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold font-sans bg-text-primary text-white hover:opacity-90 transition-colors cursor-pointer"
          >
            Editar
          </button>
        )}
        {isDeleted ? (
          <button
            type="button"
            onClick={onRestore}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold font-sans border border-success bg-success-bg text-success-text hover:bg-success hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            Activar
          </button>
        ) : (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold font-sans border border-error bg-error-bg text-error-text hover:bg-error hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

function HeroSection({ book }: { book: Book }) {
  const isDeleted = !!book.deletedAt;
  const isAvailable = !isDeleted && book.stock > 0;

  return (
    <div className="flex flex-row gap-8">
      <div className="w-[168px] h-[236px] rounded-xl overflow-hidden shrink-0 border border-border-light">
        <BookCover src={book.imageUrl} alt={book.title} />
      </div>

      <div className="flex flex-col gap-3 min-w-0 flex-1">
        <h1 className="font-serif text-[26px] font-bold text-text-primary leading-tight">
          {book.title}
        </h1>
        <p className="font-sans text-[15px] text-text-secondary">{book.author?.name ?? '—'}</p>

        <div className="flex items-center gap-2">
          {book.genre && <Badge variant="warning">{book.genre.name}</Badge>}
          {isDeleted ? (
            <Badge variant="purple">Eliminado</Badge>
          ) : isAvailable ? (
            <Badge variant="success">Disponible</Badge>
          ) : (
            <Badge variant="error">Sin stock</Badge>
          )}
        </div>

        <hr className="border-border-light" />

        <div className="flex flex-row gap-8 flex-wrap">
          <MetaItem label="Editorial" value={book.publisher?.name} />
          <MetaItem label="Año" value={book.year} />
          <MetaItem label="Páginas" value={book.pages} />
          <MetaItem label="Idioma" value={book.language} />
          <MetaItem label="Precio" value={formatPrice(book.price)} />
        </div>

        {(book.sku || book.isbn) && (
          <>
            <hr className="border-border-light" />
            <div className="flex items-center gap-6 font-sans text-xs text-text-secondary">
              {book.sku && <span>SKU: {book.sku}</span>}
              {book.sku && book.isbn && (
                <span className="w-px h-3.5 bg-border-light" aria-hidden="true" />
              )}
              {book.isbn && <span>ISBN: {book.isbn}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MidSection({ book }: { book: Book }) {
  if (!book.synopsis) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-base font-bold text-text-primary">Sinopsis</h2>
        <p className="font-sans text-[13px] leading-[1.6] text-text-primary">{book.synopsis}</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-bg-light border border-border-light p-4">
        <Quote size={18} className="text-accent shrink-0 mt-0.5" />
        <p className="font-sans text-[13px] italic leading-[1.6] text-text-secondary">
          {book.synopsis}
        </p>
      </div>
    </div>
  );
}

function SameAuthorSection({
  authorId,
  authorSlug,
  authorName,
  currentId,
}: {
  authorId: string;
  authorSlug?: string;
  authorName?: string;
  currentId: string;
}) {
  const navigate = useNavigate();
  const setSelectedBook = useBookStore((s) => s.setSelectedBook);

  const { data, isLoading } = useBooks({
    authorId,
    status: 'active',
    limit: 6,
    include: ['genre'],
  });

  const others = (data?.items ?? []).filter((b) => b.id !== currentId);
  if (!isLoading && others.length === 0) return null;

  function openBook(book: Book) {
    setSelectedBook(book);
    navigate(`/books/${book.slug}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-base font-bold text-text-primary">
          Más de {authorName ?? 'este autor'}
        </h2>
        <Link
          to={`/books?author=${authorSlug ?? authorId}`}
          className="font-sans text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-border-light animate-pulse h-[220px]" />
            ))
          : others.map((book) => (
              // biome-ignore lint/a11y/useSemanticElements: card navegable con estructura compleja
              <div
                key={book.id}
                role="button"
                tabIndex={0}
                onClick={() => openBook(book)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openBook(book);
                }}
                className="bg-surface-light rounded-xl border border-border-light p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md hover:border-accent/40 transition-all"
              >
                <div className="w-full h-40 rounded-lg overflow-hidden border border-border-light">
                  <BookCover src={book.imageUrl} alt={book.title} />
                </div>
                <h3 className="font-sans text-sm font-semibold text-text-primary line-clamp-1">
                  {book.title}
                </h3>
                <p className="font-sans text-xs text-text-secondary">
                  {book.year ?? '—'} · {formatPrice(book.price)}
                </p>
                <div className="self-start">
                  {book.stock > 0 ? (
                    <Badge variant="success">Disponible</Badge>
                  ) : (
                    <Badge variant="error">Sin stock</Badge>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}


export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setSelectedBook = useBookStore((s) => s.setSelectedBook);
  const toast = useToastStore((s) => s.toast);
  const { book, isLoading, isNotFound } = useBookDetail(slug ?? '');

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const deleteBook = useDeleteBook();
  const restoreBook = useRestoreBook();

  async function handleDelete() {
    if (!book) return;
    try {
      await deleteBook.mutateAsync(book.id);
      const updated = { ...book, deletedAt: new Date().toISOString() };
      queryClient.setQueryData([BOOK_DETAIL_KEY, slug], updated);
      setSelectedBook(updated);
      toast('success', 'Libro eliminado');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.error.message : 'Ocurrió un error inesperado');
    } finally {
      setDeleteOpen(false);
    }
  }

  async function handleRestore() {
    if (!book) return;
    try {
      const updated = await restoreBook.mutateAsync(book.id);
      queryClient.setQueryData([BOOK_DETAIL_KEY, slug], updated);
      setSelectedBook(updated);
      toast('success', 'Libro activado');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.error.message : 'Ocurrió un error inesperado');
    } finally {
      setRestoreOpen(false);
    }
  }

  if (isLoading) return <LoadingSkeleton />;
  if (isNotFound || !book) return <NotFoundState onBack={() => navigate('/books')} />;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        book={book}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onRestore={() => setRestoreOpen(true)}
        onBack={() => navigate('/books')}
      />

      <div className="px-8 py-6 flex flex-col gap-8">
        <HeroSection book={book} />
        <MidSection book={book} />
        <SameAuthorSection
          authorId={book.authorId}
          authorSlug={book.author?.slug}
          authorName={book.author?.name}
          currentId={book.id}
        />
      </div>

      <BookFormModal
        open={editOpen}
        book={book}
        onClose={() => setEditOpen(false)}
        onSuccess={(saved) => {
          setSelectedBook(saved);
          queryClient.setQueryData([BOOK_DETAIL_KEY, saved.slug], saved);
          if (saved.slug !== slug) navigate(`/books/${saved.slug}`, { replace: true });
        }}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Eliminar libro"
        description={`¿Estás seguro que quieres eliminar "${book.title}"? Esta acción se puede revertir.`}
        confirmLabel="Sí, eliminar"
        variant="destructive"
        loading={deleteBook.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmModal
        open={restoreOpen}
        title="Activar libro"
        description={`¿Quieres activar "${book.title}"?`}
        confirmLabel="Sí, activar"
        variant="success"
        loading={restoreBook.isPending}
        onConfirm={handleRestore}
        onCancel={() => setRestoreOpen(false)}
      />
    </div>
  );
}
