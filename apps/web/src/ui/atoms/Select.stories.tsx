import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select } from './Select';

const GENEROS = [
  { value: 'ficcion', label: 'Ficción' },
  { value: 'terror', label: 'Terror' },
  { value: 'romance', label: 'Romance' },
  { value: 'historia', label: 'Historia' },
  { value: 'ciencia', label: 'Ciencia ficción' },
];

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: 'Género',
    placeholder: 'Seleccionar género',
    options: GENEROS,
  },
};

export const ConValor: Story = {
  args: {
    label: 'Género',
    options: GENEROS,
    value: 'terror',
  },
};

export const ConError: Story = {
  args: {
    label: 'Género',
    placeholder: 'Seleccionar género',
    options: GENEROS,
    error: 'El género es requerido',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Género',
    options: GENEROS,
    value: 'ficcion',
    disabled: true,
  },
};

export const Interactivo: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        label="Género"
        placeholder="Seleccionar género"
        options={GENEROS}
        value={value}
        onChange={setValue}
      />
    );
  },
};
