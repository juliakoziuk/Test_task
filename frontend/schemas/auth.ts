import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email, e.g. jane@example.com.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email,
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one digit.'),
});

export type AuthFormValues = { name?: string; email: string; password: string };
