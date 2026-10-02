import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from './Toast';
import { useToastStore } from '@/store/toast.store';
import { Button } from './Button';

const meta: Meta = {
  title: 'Atoms/Toast',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

export const Interactivo: Story = {
  render: () => {
    const toast = useToastStore((s) => s.toast);
    return (
      <div className="flex gap-3">
        <Button
          variant="success"
          onClick={() => toast('Libro creado exitosamente', 'success')}
        >
          Toast éxito
        </Button>
        <Button
          variant="destructive"
          onClick={() => toast('Error al eliminar el libro', 'error')}
        >
          Toast error
        </Button>
        <Toaster />
      </div>
    );
  },
};
