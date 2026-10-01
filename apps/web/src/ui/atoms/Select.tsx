import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({ options, value, onChange, label, placeholder, error, disabled, className = '' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(val: string) {
    onChange?.(val)
    setOpen(false)
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
          onClick={() => setOpen(o => !o)}
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
          <ChevronDown
            size={15}
            className={`shrink-0 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul className="absolute z-20 mt-1.5 w-full bg-surface-light border border-border-light rounded-lg shadow-lg py-1 overflow-hidden">
            {options.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => select(opt.value)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-sans text-left hover:bg-bg-light transition-colors cursor-pointer"
                >
                  <span className={opt.value === value ? 'text-text-primary font-semibold' : 'text-text-primary'}>
                    {opt.label}
                  </span>
                  {opt.value === value && <Check size={13} className="text-accent shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <span className="text-error-text font-sans text-xs">{error}</span>}
    </div>
  )
}
