import { Check } from 'lucide-react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function Checkbox({ label, checked, onChange, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
          checked ? 'bg-accent border-accent' : 'bg-surface-light border-border-light'
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} className="text-white" />}
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label && <span className="font-sans text-[13px] text-text-primary">{label}</span>}
    </label>
  );
}
