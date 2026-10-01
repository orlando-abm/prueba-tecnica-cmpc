import { useRef, useState } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import { BookCover } from './BookCover';

interface ImageDropzoneProps {
  value?: string;
  uploading: boolean;
  error?: string;
  onFile: (file: File) => void;
  onClear: () => void;
}

export function ImageDropzone({ value, uploading, error, onFile, onClear }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-text-primary font-sans text-[13px] font-medium">Imagen</span>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full h-40 rounded-xl border-[2px] border-dashed transition-colors overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent
          ${dragging ? 'border-accent bg-accent/5' : error ? 'border-error bg-error-bg/30' : 'border-border-light bg-surface-light hover:border-accent hover:bg-accent/5'}
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {value ? (
          <>
            <BookCover src={value} alt="Preview" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="text-white font-sans text-xs font-semibold flex items-center gap-1.5">
                <ImagePlus size={14} />
                Cambiar
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary">
            <Upload size={24} className={dragging ? 'text-accent' : ''} />
            <span className="font-sans text-xs text-center px-4">
              {uploading
                ? 'Subiendo...'
                : dragging
                  ? 'Suelta la imagen aquí'
                  : 'Arrastra una imagen o haz clic'}
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="font-sans text-xs text-text-secondary font-medium">Subiendo...</span>
          </div>
        )}
      </div>

      {value && !uploading && (
        <button
          type="button"
          onClick={onClear}
          className="self-start inline-flex items-center gap-1 text-error-text font-sans text-xs hover:underline cursor-pointer"
        >
          <X size={11} />
          Quitar imagen
        </button>
      )}

      {error && <span className="text-error-text font-sans text-xs">{error}</span>}
    </div>
  );
}
