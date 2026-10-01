import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string({ required_error: 'El email es requerido' }).email('El email no es válido'),
  password: z.string({ required_error: 'La contraseña es requerida' }).min(8, 'La contraseña debe tener al menos 8 caracteres'),
}).strict({ message: 'El cuerpo contiene campos no permitidos' });
export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = LoginSchema.extend({});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const UserProfileSchema = z.object({
  name: z.string().min(1),
  lastname: z.string().min(1),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});
export type UserProfileDto = z.infer<typeof UserProfileSchema>;
