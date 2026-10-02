import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, Eye } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Título del libro',
    placeholder: 'Ej. El Principito',
  },
};

export const WithError: Story = {
  args: {
    label: 'Correo electrónico',
    placeholder: 'usuario@cmpc.cl',
    error: 'El correo es requerido',
  },
};

export const WithStartIcon: Story = {
  args: {
    placeholder: 'Buscar libros...',
    startIcon: <Search size={16} />,
  },
};

export const WithEndIcon: Story = {
  args: {
    label: 'Contraseña',
    type: 'password',
    placeholder: '••••••••',
    endIcon: <Eye size={16} />,
  },
};

export const Disabled: Story = {
  args: {
    label: 'ISBN',
    placeholder: '978-3-16-148410-0',
    disabled: true,
    value: '978-3-16-148410-0',
  },
};
