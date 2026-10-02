import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info', 'purple'],
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Disponible: Story = {
  args: { children: 'Disponible', variant: 'success' },
};

export const SinStock: Story = {
  args: { children: 'Sin stock', variant: 'error' },
};

export const Genero: Story = {
  args: { children: 'Ficción', variant: 'warning' },
};

export const Info: Story = {
  args: { children: 'Nuevo', variant: 'info' },
};

export const Eliminado: Story = {
  args: { children: 'Eliminado', variant: 'purple' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="success">Disponible</Badge>
      <Badge variant="error">Sin stock</Badge>
      <Badge variant="warning">Ficción</Badge>
      <Badge variant="info">Nuevo</Badge>
      <Badge variant="purple">Eliminado</Badge>
    </div>
  ),
};
