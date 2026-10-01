import { create } from 'zustand';

type ToastVariant = 'success' | 'error';

interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  toast: (variant: ToastVariant, message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast(variant, message) {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, variant, message }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4000,
    );
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
