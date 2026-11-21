import { z } from 'zod';
import { LEAD_SOURCES, LEAD_STATUSES } from './constants';

// Mirrors the backend validators so users get instant feedback; the server remains the authority.
const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100),
  email,
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Enter a valid phone number')
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  company: z.string().trim().min(1, 'Company name is required').max(120),
  source: z.enum(LEAD_SOURCES, { errorMap: () => ({ message: 'Select a lead source' }) }),
  status: z.enum(LEAD_STATUSES, { errorMap: () => ({ message: 'Select a status' }) }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});
