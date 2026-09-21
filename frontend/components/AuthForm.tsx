import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { AuthFormValues, loginSchema, registerSchema } from '../schemas/auth';
import { authApi } from '../services/api';
import { useAuth } from './AuthProvider';

/**
 * Browsers autofill saved credentials into sign-up forms and often ignore autocomplete="off".
 * Keeping the field read-only until it is focused stops that, so the form starts empty.
 */
const antiAutofill = (enabled: boolean) =>
  enabled
    ? {
        readOnly: true,
        onFocus: (e: { currentTarget: HTMLInputElement }) => {
          e.currentTarget.readOnly = false;
        },
      }
    : {};

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const isLogin = mode === 'login';
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as Resolver<AuthFormValues>,
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '' },
  });

  const submit = handleSubmit(async ({ name, email, password }) => {
    setServerError(null);
    try {
      const auth = isLogin
        ? await authApi.login(email, password)
        : await authApi.register(name ?? '', email, password);
      signIn(auth);
      const next = typeof router.query.next === 'string' ? router.query.next : '/quizzes';
      await router.push(next.startsWith('/') && !next.startsWith('//') ? next : '/quizzes');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  });

  const otherHref = { pathname: isLogin ? '/register' : '/login', query: router.query };

  return (
    <div className="auth">
      <h1>{isLogin ? 'Log in' : 'Create account'}</h1>
      <form className="card" onSubmit={submit} noValidate autoComplete={isLogin ? 'on' : 'off'}>
        {!isLogin && (
          <>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="off"
              placeholder="Jane Doe"
              aria-invalid={errors.name ? true : undefined}
              {...antiAutofill(true)}
              {...register('name')}
            />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete={isLogin ? 'username' : 'off'}
          placeholder="jane@example.com"
          aria-invalid={errors.email ? true : undefined}
          {...antiAutofill(!isLogin)}
          {...register('email')}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          placeholder={isLogin ? undefined : 'At least 8 characters, letters and digits'}
          aria-invalid={errors.password ? true : undefined}
          {...antiAutofill(!isLogin)}
          {...register('password')}
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}

        {serverError && <p className="error">{serverError}</p>}
        <div className="row actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
          </button>
          <Link href={otherHref} className="muted">
            {isLogin ? 'No account? Register' : 'Have an account? Log in'}
          </Link>
        </div>
      </form>
    </div>
  );
}
