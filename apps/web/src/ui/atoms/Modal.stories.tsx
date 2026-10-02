import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Atoms/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Abierto: Story = {
  args: {
    open: true,
    title: 'Editar libro',
    onClose: () => {},
    children: (
      <p className="text-sm text-text-secondary font-sans">
        Contenido del modal — formulario, confirmación, etc.
      </p>
    ),
  },
};

export const Cerrado: Story = {
  args: {
    open: false,
    title: 'Editar libro',
    onClose: () => {},
    children: <p>Este modal está cerrado.</p>,
  },
};

export const Interactivo: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal open={open} title="Confirmar acción" onClose={() => setOpen(false)}>
          <p className="text-sm text-text-secondary font-sans">
            ¿Estás seguro de que deseas realizar esta acción?
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirmar</Button>
          </div>
        </Modal>
      </div>
    );
  },
};
