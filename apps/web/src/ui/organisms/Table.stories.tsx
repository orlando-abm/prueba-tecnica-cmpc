import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { useState } from 'react';
import { Table } from './Table';
import { Badge } from '@/ui/atoms/Badge';

interface Libro {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: string;
  stock: number;
  deletedAt: string | null;
}

const libros: Libro[] = [
  { id: '1', title: 'Cien años de soledad', author: 'Gabriel García Márquez', genre: 'Realismo mágico', price: '$14.990', stock: 8, deletedAt: null },
  { id: '2', title: 'El Principito', author: 'Antoine de Saint-Exupéry', genre: 'Ficción', price: '$9.990', stock: 0, deletedAt: null },
  { id: '3', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', genre: 'Clásico', price: '$19.990', stock: 3, deletedAt: null },
  { id: '4', title: 'Rayuela', author: 'Julio Cortázar', genre: 'Ficción', price: '$12.990', stock: 5, deletedAt: null },
  { id: '5', title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', genre: 'Misterio', price: '$11.990', stock: 0, deletedAt: '2024-01-01' },
];

const columns = [
  { key: 'title', header: 'Título', sortKey: 'title' },
  { key: 'author', header: 'Autor', sortKey: 'author' },
  { key: 'genre', header: 'Género' },
  { key: 'price', header: 'Precio', sortKey: 'price', className: 'text-right' },
  {
    key: 'stock',
    header: 'Estado',
    render: (row: Libro) =>
      row.deletedAt ? (
        <Badge variant="purple">Eliminado</Badge>
      ) : row.stock > 0 ? (
        <Badge variant="success">Disponible</Badge>
      ) : (
        <Badge variant="error">Sin stock</Badge>
      ),
  },
];

const meta: Meta = {
  title: 'Organisms/Table',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Table
      columns={columns}
      data={libros}
      keyField="id"
      onRowClick={fn()}
    />
  ),
};

export const ConOrdenamiento: Story = {
  render: () => {
    const [sortBy, setSortBy] = useState('title');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    function handleSort(key: string) {
      if (key === sortBy) {
        setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(key);
        setOrder('asc');
      }
    }

    const sorted = [...libros].sort((a, b) => {
      const va = String((a as Record<string, unknown>)[sortBy] ?? '');
      const vb = String((b as Record<string, unknown>)[sortBy] ?? '');
      return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    return (
      <Table
        columns={columns}
        data={sorted}
        keyField="id"
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onRowClick={fn()}
      />
    );
  },
};

export const Vacia: Story = {
  render: () => (
    <Table
      columns={columns}
      data={[]}
      keyField="id"
      emptyMessage="No se encontraron libros con los filtros aplicados."
    />
  ),
};

export const SinClickFila: Story = {
  render: () => (
    <Table
      columns={columns}
      data={libros}
      keyField="id"
    />
  ),
};
