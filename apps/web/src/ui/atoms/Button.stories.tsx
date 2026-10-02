import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen, Download, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'success'],
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Iniciar sesión', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Cancelar', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'Ver más', variant: 'ghost' },
};

export const Destructive: Story = {
  args: { children: 'Eliminar libro', variant: 'destructive' },
};

export const Success: Story = {
  args: { children: 'Restaurar', variant: 'success' },
};

export const Disabled: Story = {
  args: { children: 'Procesando...', variant: 'primary', disabled: true },
};

export const WithIcon: Story = {
  args: {
    children: (
      <span className="flex items-center gap-2">
        <Download size={16} />
        Exportar CSV
      </span>
    ),
    variant: 'secondary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">
        <span className="flex items-center gap-1.5"><Trash2 size={14} /> Eliminar</span>
      </Button>
      <Button variant="success">
        <span className="flex items-center gap-1.5"><BookOpen size={14} /> Restaurar</span>
      </Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  ),
};
