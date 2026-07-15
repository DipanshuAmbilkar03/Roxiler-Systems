import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'password must be 8–16 characters')
  .max(16, 'password must be 8–16 characters')
  .regex(/[A-Z]/, 'password must include at least one uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'password must include at least one special character');

export const loginSchema = z.object({
  email: z.string().email('email must be an email'),
  password: z.string().min(1, 'password is required'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(20, 'name must be longer than or equal to 20 characters')
    .max(60, 'name must be shorter than or equal to 60 characters'),
  email: z.string().email('email must be an email'),
  password: passwordSchema,
  address: z.string().max(400, 'address must be shorter than or equal to 400 characters'),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'current password is required'),
  newPassword: passwordSchema,
});

export const createUserSchema = signupSchema.extend({
  role: z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER']),
});

export const createStoreSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  ownerId: z.string().uuid().optional().or(z.literal('')),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type PasswordUpdateForm = z.infer<typeof passwordUpdateSchema>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type CreateStoreForm = z.infer<typeof createStoreSchema>;
