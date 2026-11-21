import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../api/client';
import { registerSchema } from '../lib/schemas';

export default function Register() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '' } });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      fieldErrors.forEach((e) => ['name', 'email', 'password'].includes(e.field) && setError(e.field, { type: 'server', message: e.message }));
      setFormError(getErrorMessage(err));
    }
  };

  const cls = (n) => `input ${errors[n] ? 'input-error' : ''}`;
  return (
    <AuthLayout title="Create your account" subtitle="Your leads stay private to your account." footer={<>Already registered? <Link to="/login" className="font-semibold text-teal-700 hover:underline">Log in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
        <FormField id="name" label="Full name" error={errors.name?.message}>
          <input id="name" type="text" autoComplete="name" className={cls('name')} {...register('name')} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className={cls('email')} {...register('email')} />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message} hint="At least 8 characters.">
          <input id="password" type="password" autoComplete="new-password" className={cls('password')} {...register('password')} />
        </FormField>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Create account
        </button>
      </form>
    </AuthLayout>
  );
}
