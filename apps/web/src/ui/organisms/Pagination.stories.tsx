import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Organisms/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-full max-w-3xl"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    page: 1,
    totalPages: 10,
    total: 195,
    limit: 20,
    onPageChange: () => {},
    onLimitChange: () => {},
    itemLabel: 'libros',
  },
};

export const PaginaMitad: Story = {
  args: {
    page: 5,
    totalPages: 10,
    total: 195,
    limit: 20,
    onPageChange: () => {},
    onLimitChange: () => {},
    itemLabel: 'libros',
  },
};

export const UltimaPagina: Story = {
  args: {
    page: 10,
    totalPages: 10,
    total: 195,
    limit: 20,
    onPageChange: () => {},
    onLimitChange: () => {},
    itemLabel: 'libros',
  },
};

export const PocasPaginas: Story = {
  args: {
    page: 2,
    totalPages: 3,
    total: 25,
    limit: 10,
    onPageChange: () => {},
    onLimitChange: () => {},
    itemLabel: 'libros',
  },
};

export const Interactivo: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const total = 195;
    const totalPages = Math.ceil(total / limit);
    return (
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        itemLabel="libros"
      />
    );
  },
};
