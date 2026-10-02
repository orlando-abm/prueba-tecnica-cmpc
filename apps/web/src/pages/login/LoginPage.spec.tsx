import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import LoginPage from './LoginPage';
import * as useLoginHook from '@/hooks/useLogin';
import { ApiError } from '@/lib/http';

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: { token: null; setToken: () => void; clearToken: () => void }) => unknown) =>
    selector({ token: null, setToken: vi.fn(), clearToken: vi.fn() }),
}));

const createWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useLoginHook, 'useLogin').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it('renderiza el formulario de login', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Ej. usuario@cmpc.cl')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra errores de validación si se envía vacío', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/correo/i)).toBeInTheDocument();
    });
  });

  it('llama a mutateAsync con las credenciales ingresadas', async () => {
    mockMutateAsync.mockResolvedValue({ token: 'jwt-token' });
    render(<LoginPage />, { wrapper: createWrapper() });
    await userEvent.type(screen.getByPlaceholderText('Ej. usuario@cmpc.cl'), 'test@cmpc.cl');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@cmpc.cl',
        password: 'password123',
      });
    });
  });

  it('muestra mensaje de error si las credenciales son inválidas', async () => {
    mockMutateAsync.mockRejectedValue(
      new ApiError(401, { code: 'AUTH_002', message: 'Correo o contraseña incorrectos' }),
    );
    render(<LoginPage />, { wrapper: createWrapper() });
    await userEvent.type(screen.getByPlaceholderText('Ej. usuario@cmpc.cl'), 'mal@cmpc.cl');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    });
  });

  it('muestra "Ingresando..." cuando isPending es true', () => {
    vi.spyOn(useLoginHook, 'useLogin').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);
    render(<LoginPage />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /ingresando/i })).toBeInTheDocument();
  });
});
