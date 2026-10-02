import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookBodySchema, type BookBodyDto } from '@repo/shared/schemas/book.schema';
import type { Book } from '@repo/shared/types/book.types';
import { useCreateBook, useUpdateBook } from '@/hooks/useBooks';
import { useGenres, useCreateGenre } from '@/hooks/useGenres';
import { useAuthors, useCreateAuthor } from '@/hooks/useAuthors';
import { usePublishers, useCreatePublisher } from '@/hooks/usePublishers';
import { uploadService } from '@/services/upload.service';
import { Button, Input, Modal, SearchSelect } from '@/ui/atoms';
import { ApiError } from '@/lib/http';
import { useToastStore } from '@/store/toast.store';
import { ImageDropzone } from './ImageDropzone';

interface BookFormModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess?: (book: Book) => void;
}

const emptyToUndefined = (v: string) => (v === '' || v == null ? undefined : v);
const numberOrUndefined = (v: string) => {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export function BookFormModal({ open, book, onClose, onSuccess }: BookFormModalProps) {
  return (
    <Modal open={open} title={book ? 'Editar libro' : 'Nuevo libro'} onClose={onClose}>
      {open && <BookFormInner book={book} onClose={onClose} onSuccess={onSuccess} />}
    </Modal>
  );
}

function BookFormInner({
  book,
  onClose,
  onSuccess,
}: Pick<BookFormModalProps, 'book' | 'onClose' | 'onSuccess'>) {
  const [uploading, setUploading] = useState(false);
  const toast = useToastStore((s) => s.toast);

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const createGenre = useCreateGenre();
  const createAuthor = useCreateAuthor();
  const createPublisher = useCreatePublisher();

  const { data: genresData } = useGenres({ status: 'active', limit: 100 });
  const { data: authorsData } = useAuthors({ status: 'active', limit: 100 });
  const { data: publishersData } = usePublishers({ status: 'active', limit: 100 });

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

  useEffect(() => {
    if (book) {
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
    } else {
      reset({ title: '', isbn: '', sku: '', synopsis: '', language: '', imageUrl: '' });
    }
  }, [book, reset]);

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

  async function onSubmit(dto: BookBodyDto) {
    try {
      const saved = book
        ? await updateBook.mutateAsync({ id: book.id, dto })
        : await createBook.mutateAsync(dto);
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const message = err.error.message;
        toast('error', message);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Título"
          placeholder="Ej. Cien años de soledad"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <label htmlFor="synopsis" className="text-text-primary font-sans text-[13px] font-medium">
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {book ? 'Guardar' : 'Crear'}
          </Button>
        </div>
    </form>
  );
}
