import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  args: { label: 'Recordarme', checked: false, onChange: () => {} },
};

export const Checked: Story = {
  args: { label: 'Recordarme', checked: true, onChange: () => {} },
};

export const SinLabel: Story = {
  args: { checked: false, onChange: () => {} },
};

export const Interactivo: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label={checked ? 'Activado' : 'Desactivado'}
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};
