import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(2).max(50),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
