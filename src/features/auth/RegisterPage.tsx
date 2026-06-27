import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';
import { authApi } from '../../api/endpoints';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { ErrorAlert } from '../../components/ui/Feedback';
import { FieldFrame, Input } from '../../components/ui/FormField';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const schema = z.object({
  email: z.email('Enter a valid email address').max(254),
  password: z.string().min(12, 'Use at least 12 characters').max(128),
  confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, { path: ['confirmation'], message: 'Passwords do not match' });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const { notify } = useToast();
  const [failure, setFailure] = useState<unknown>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async ({ email, password }) => {
    setFailure(undefined);
    try {
      await authApi.register({ email, password });
      notify('Account created. Sign in with your new credentials.', 'success');
      void navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      setFailure(error);
    }
  });

  return <div className="auth-card"><div className="auth-card__icon"><UserPlus /></div><p className="eyebrow">Get started</p><h2>Create your account</h2><p>Your password is sent only to the authentication service over TLS.</p>{failure ? <ErrorAlert error={failure} /> : null}<form onSubmit={submit} className="form-stack"><FieldFrame label="Email address" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" invalid={Boolean(errors.email)} {...register('email')} /></FieldFrame><FieldFrame label="Password" htmlFor="password" error={errors.password?.message} hint="Minimum 12 characters"><Input id="password" type="password" autoComplete="new-password" invalid={Boolean(errors.password)} {...register('password')} /></FieldFrame><FieldFrame label="Confirm password" htmlFor="confirmation" error={errors.confirmation?.message}><Input id="confirmation" type="password" autoComplete="new-password" invalid={Boolean(errors.confirmation)} {...register('confirmation')} /></FieldFrame><div className="security-note"><ShieldCheck size={18} /><span>Access tokens remain limited to this browser tab.</span></div><Button type="submit" size="lg" loading={isSubmitting}>Create account</Button></form><p className="auth-card__switch">Already registered? <Link to="/login">Sign in</Link></p></div>;
}
