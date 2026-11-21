import { z } from 'zod';
import { LEAD_SOURCES, LEAD_STATUSES } from '../models/Lead.js';

const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

const enumField = (values, label) =>
  z.enum(values, { errorMap: () => ({ message: `${label} must be one of: ${values.join(', ')}` }) });

const leadFields = {
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .max(254),
  phone: z
    .string({ required_error: 'Phone is required' })
    .trim()
    .regex(PHONE_REGEX, 'Enter a valid phone number')
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  company: z.string({ required_error: 'Company is required' }).trim().min(1, 'Company is required').max(120),
  source: enumField(LEAD_SOURCES, 'Source'),
  status: enumField(LEAD_STATUSES, 'Status'),
};

// userId (or any other unknown key) is stripped by zod, so it can never be client-supplied.
export const createLeadSchema = z.object({
  ...leadFields,
  source: leadFields.source.default('Website'),
  status: leadFields.status.default('New'),
});

export const updateLeadSchema = z
  .object(leadFields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export const listLeadsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: enumField(LEAD_STATUSES, 'Status').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
