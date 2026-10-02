import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChangePasswordSchema } from '@repo/shared/schemas/auth.schema';
import type { ChangePasswordDto } from '@repo/shared/schemas/auth.schema';
import { useMe, useChangePassword } from '@/hooks/useMe';
import { Button, Input } from '@/ui/atoms';
import { ApiError } from '@/lib/http';
import { useToastStore } from '@/store/toast.store';

const FormSchema = ChangePasswordSchema.extend({
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof FormSchema>;

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  USER: 'Usuario',
};

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const changePassword = useChangePassword();
  const toast = useToastStore((s) => s.toast);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  async function onSubmit(values: FormValues) {
    try {
      const dto: ChangePasswordDto = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      await changePassword.mutateAsync(dto);
      reset();
      toast('success', 'Contraseña actualizada correctamente');
    } catch (err) {
      if (err instanceof ApiError) {
        setError('currentPassword', { message: err.error.message });
        toast('error', err.error.message);
      }
    }
  }

  const fullName = user?.profile
    ? `${user.profile.name} ${user.profile.lastname}`
    : null;

  return (
    <div className="p-6 sm:p-10 flex flex-col items-center gap-8">
      <div className="w-full max-w-xl">
        <h1 className="font-serif text-3xl font-bold text-text-primary">Mi perfil</h1>
        <p className="font-sans text-sm text-text-secondary mt-1">
          Información de tu cuenta
        </p>
      </div>

      {/* Info card */}
      <div className="w-full max-w-xl bg-surface-light rounded-xl border border-border-light p-6 flex flex-col gap-4">
        <h2 className="font-sans text-sm font-semibold text-text-primary">Datos de cuenta</h2>
        {isLoading ? (
          <p className="text-sm text-text-secondary font-sans">Cargando...</p>
        ) : user ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {fullName && (
              <div className="col-span-2 flex flex-col gap-1">
                <dt className="text-xs font-sans text-text-secondary">Nombre</dt>
                <dd className="text-sm font-sans text-text-primary">{fullName}</dd>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-sans text-text-secondary">Correo</dt>
              <dd className="text-sm font-sans text-text-primary">{user.email}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-sans text-text-secondary">Rol</dt>
              <dd className="text-sm font-sans text-text-primary">
                {ROLE_LABEL[user.role] ?? user.role}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-sans text-text-secondary">Miembro desde</dt>
              <dd className="text-sm font-sans text-text-primary">
                {new Date(user.createdAt).toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
            {user.profile?.phone && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-sans text-text-secondary">Teléfono</dt>
                <dd className="text-sm font-sans text-text-primary">{user.profile.phone}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-text-secondary font-sans">No se pudieron cargar los datos.</p>
        )}
      </div>

      {/* Change password */}
      <div className="w-full max-w-xl bg-surface-light rounded-xl border border-border-light p-6 flex flex-col gap-4">
        <h2 className="font-sans text-sm font-semibold text-text-primary">Cambiar contraseña</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Contraseña actual"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            placeholder="Repite la nueva contraseña"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              Guardar contraseña
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
