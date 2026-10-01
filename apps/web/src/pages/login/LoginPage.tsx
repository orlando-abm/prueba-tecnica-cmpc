import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@repo/shared/schemas/auth.schema';
import type { LoginDto } from '@repo/shared/schemas/auth.schema';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Checkbox } from '@/ui/atoms/Checkbox';
import { useLogin } from '@/hooks/useLogin';
import { ApiError } from '@/lib/http';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const login = useLogin();
  const setToken = useAuthStore((s) => s.setToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginDto) {
    try {
      const res = await login.mutateAsync(data);
      setToken(res.token, remember);
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.error.message });
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — oculto en mobile */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-bg-dark flex-col justify-between p-10">
        <div className="flex flex-col gap-5">
          <span className="font-serif text-[100px] leading-[0.8] font-bold text-accent">"</span>
          <p className="font-serif text-[34px] font-bold text-text-primary-dark leading-[1.25]">
            Los libros son{'\n'}espejos del alma.
          </p>
          <div className="w-12 h-[3px] bg-accent rounded-sm" />
          <span className="font-sans text-[13px] italic text-text-secondary">— Virginia Woolf</span>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-serif text-[38px] font-bold text-text-primary-dark leading-[1.1]">
            GESTIONA{'\n'}TU LIBRERÍA.
          </p>
          <p className="font-sans text-[13px] text-text-secondary-dark leading-relaxed">
            Inventario digital para CMPC Libros — controla stock, géneros y autores desde un solo
            lugar.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-bg-light flex items-center justify-center px-6 py-10 lg:p-20">
        <div className="flex flex-col gap-6 w-full max-w-[380px]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
            <span className="font-serif text-lg font-bold text-text-primary">CMPC Libros</span>
          </div>

          <div className="h-10" />

          {/* Form */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-serif text-[32px] font-bold text-text-primary">Bienvenido.</h1>
              <p className="font-sans text-sm text-text-secondary">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              <Input
                label="Tu correo electrónico"
                type="email"
                placeholder="Ej. usuario@cmpc.cl"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Tu contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="cursor-pointer hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember"
                  label="Recordarme"
                  checked={remember}
                  onChange={setRemember}
                />
                <button
                  type="button"
                  className="font-sans text-[13px] text-accent hover:underline cursor-pointer"
                >
                  ¿Problemas para ingresar?
                </button>
              </div>

              {errors.root && (
                <p className="text-error-text font-sans text-sm text-center">
                  {errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting || login.isPending}
              >
                {login.isPending ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
