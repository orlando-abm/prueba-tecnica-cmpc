import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Plus, Loader2, X } from 'lucide-react';
import type { SelectOption } from './Select';

interface SearchSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onAdd?: (name: string) => Promise<void>;
  adding?: boolean;
}

export function SearchSelect({
  options,
  value,
  onChange,
  onClear,
  label,
  placeholder,
  error,
  disabled,
  className = '',
  onAdd,
  adding = false,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  const showCreate = !!onAdd;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch('');
  }, [open]);

  function select(val: string) {
    onChange?.(val);
    setOpen(false);
    setSearch('');
  }

  async function handleAdd() {
    if (!onAdd) return;
    await onAdd(search.trim());
    setSearch('');
    setOpen(false);
  }

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`} ref={ref}>
      {label && (
        <label htmlFor={id} className="text-text-primary font-sans text-[13px] font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-2 rounded-lg border-[1.5px] bg-surface-light pl-3.5 pr-3 py-2.5 text-sm font-sans text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-error'
              : open
                ? 'border-accent border-2'
                : 'border-border-light hover:border-text-secondary'
          }`}
        >
          <span className={selected ? 'text-text-primary' : 'text-text-secondary'}>
            {selected?.label ?? placeholder ?? 'Seleccionar'}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {selected && onClear && (
              <span
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onClear())}
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={13} />
              </span>
            )}
            <ChevronDown
              size={15}
              className={`text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full bg-surface-light border border-border-light rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-border-light">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-md border border-border-light bg-bg-light px-3 py-1.5 text-sm font-sans text-text-primary placeholder:text-text-secondary outline-none focus:border-accent transition-colors"
              />
            </div>

            <ul className="max-h-[200px] overflow-y-auto py-1">
              {filtered.length === 0 && !showCreate && (
                <li className="px-3.5 py-2.5 text-sm font-sans text-text-secondary">
                  Sin resultados
                </li>
              )}
              {filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => select(opt.value)}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-sans text-left hover:bg-bg-light transition-colors cursor-pointer"
                  >
                    <span
                      className={
                        opt.value === value ? 'text-text-primary font-semibold' : 'text-text-primary'
                      }
                    >
                      {opt.label}
                    </span>
                    {opt.value === value && <Check size={13} className="text-accent shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>

            {showCreate && (
              <div className="border-t border-border-light p-1.5">
                <button
                  type="button"
                  disabled={adding}
                  onClick={handleAdd}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-sans text-accent font-semibold hover:bg-accent/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {adding ? (
                    <Loader2 size={14} className="animate-spin shrink-0" />
                  ) : (
                    <Plus size={14} className="shrink-0" />
                  )}
                  <span className="truncate min-w-0">
                    {search.trim() ? `Crear "${search.trim()}"` : 'Crear nuevo'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <span className="text-error-text font-sans text-xs">{error}</span>}
    </div>
  );
}
