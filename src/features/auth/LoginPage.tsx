import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { ErrorAlert } from '../../components/ui/Feedback';
import { FieldFrame, Input } from '../../components/ui/FormField';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { safeInternalPath } from '../../utils/navigation';

const schema = z.object({
  email: z.email('Enter a valid email address').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [failure, setFailure] = useState<unknown>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async (values) => {
    setFailure(undefined);
    try {
      await login(values.email, values.password);
      const target = safeInternalPath((location.state as { from?: string } | null)?.from);
      void navigate(target, { replace: true });
    } catch (error) {
      setFailure(error);
    }
  });

  return <div className="auth-card"><div className="auth-card__icon"><LockKeyhole /></div><p className="eyebrow">Welcome back</p><h2>Sign in to your account</h2><p>Manage purchases, payments, and fulfillment from one secure portal.</p>{failure ? <ErrorAlert error={failure} /> : null}<form onSubmit={submit} className="form-stack"><FieldFrame label="Email address" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" invalid={Boolean(errors.email)} {...register('email')} /></FieldFrame><FieldFrame label="Password" htmlFor="password" error={errors.password?.message}><Input id="password" type="password" autoComplete="current-password" invalid={Boolean(errors.password)} {...register('password')} /></FieldFrame><Button type="submit" size="lg" loading={isSubmitting} icon={ArrowRight}>Sign in</Button></form><p className="auth-card__switch">New to Atlas? <Link to="/register">Create an account</Link></p></div>;
}
