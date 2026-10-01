import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  itemLabel?: string
}

const LIMIT_OPTIONS = [10, 20, 50, 100]

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push('...')
  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange, itemLabel = 'registros' }: PaginationProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const pages = getPageRange(page, totalPages)

  return (
    <div className="flex items-center justify-between w-full">
      {/* Rows per page */}
      <div className="flex items-center gap-2" ref={ref}>
        <span className="text-[13px] font-sans text-text-secondary">Filas por página:</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 rounded-[6px] bg-surface-light border-[1.5px] border-border-light px-3 py-[7px] text-[13px] font-semibold font-sans text-text-primary cursor-pointer hover:border-text-secondary transition-colors"
          >
            {limit}
            <ChevronDown size={13} className={`text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <ul className="absolute z-20 bottom-full mb-1 left-0 bg-surface-light border border-border-light rounded-lg shadow-lg py-1 min-w-full overflow-hidden">
              {LIMIT_OPTIONS.map(opt => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => { onLimitChange(opt); onPageChange(1); setOpen(false) }}
                    className={`w-full px-3.5 py-2 text-[13px] font-sans text-left cursor-pointer hover:bg-bg-light transition-colors ${opt === limit ? 'font-semibold text-text-primary' : 'text-text-primary'}`}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Info */}
      <span className="text-[13px] font-sans text-text-secondary">
        Mostrando {from}-{to} de {total.toLocaleString('es-CL')} {itemLabel}
      </span>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center justify-center rounded-[6px] bg-surface-light border border-border-light px-[10px] py-[7px] cursor-pointer hover:border-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} className="text-text-secondary" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-[7px] text-[13px] font-sans text-text-secondary select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex items-center justify-center rounded-[6px] border px-3 py-[7px] text-[13px] font-sans cursor-pointer transition-colors ${
                p === page
                  ? 'bg-accent border-accent text-white font-semibold'
                  : 'bg-surface-light border-border-light text-text-primary hover:border-text-secondary'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center justify-center rounded-[6px] bg-surface-light border border-border-light px-[10px] py-[7px] cursor-pointer hover:border-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} className="text-text-primary" />
        </button>
      </div>
    </div>
  )
}
