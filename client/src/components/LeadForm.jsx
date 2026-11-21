import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import FormField from './FormField';
import { leadSchema } from '../lib/schemas';
import { LEAD_SOURCES, LEAD_STATUSES } from '../lib/constants';

const EMPTY = { name: '', email: '', phone: '', company: '', source: 'Website', status: 'New' };

/**
 * onSubmit(values) must return a promise. If it rejects with server field errors
 * ([{ field, message }]) they are shown under the matching inputs.
 */
export default function LeadForm({ initialValues, submitLabel, onSubmit, onCancel, serverErrors }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(leadSchema), defaultValues: initialValues ?? EMPTY });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    (serverErrors ?? []).forEach((e) => {
      if (e.field in EMPTY) setError(e.field, { type: 'server', message: e.message });
    });
  }, [serverErrors, setError]);

  const field = (name) => ({
    id: name,
    className: `input ${errors[name] ? 'input-error' : ''}`,
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    ...register(name),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="name" label="Full name" error={errors.name?.message}>
          <input type="text" autoComplete="off" placeholder="e.g. Deepak Sharma" {...field('name')} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="off" placeholder="name@company.com" {...field('email')} />
        </FormField>
        <FormField id="phone" label="Phone number" error={errors.phone?.message} hint="Include the country code if applicable.">
          <input type="tel" autoComplete="off" placeholder="+91 98765 43210" {...field('phone')} />
        </FormField>
        <FormField id="company" label="Company name" error={errors.company?.message}>
          <input type="text" autoComplete="off" placeholder="e.g. Acme Corp" {...field('company')} />
        </FormField>
        <FormField id="source" label="Lead source" error={errors.source?.message}>
          <select {...field('source')}>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField id="status" label="Lead status" error={errors.status?.message}>
          <select {...field('status')}>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
