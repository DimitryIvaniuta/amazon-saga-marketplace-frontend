import { AlertCircle, CheckCircle2, CircleOff, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { ApiClientError } from '../../api/client';
import { Button } from './Button';

export function Alert({ tone = 'error', title, children }: { tone?: 'error' | 'success' | 'info'; title: string; children?: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  return <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}><Icon size={20} /><div><strong>{title}</strong>{children ? <div>{children}</div> : null}</div></div>;
}

export function ErrorAlert({ error }: { error: unknown }) {
  const apiError = error instanceof ApiClientError ? error : null;
  return (
    <Alert title={apiError?.message ?? 'Something went wrong'}>
      {apiError?.violations.length ? <ul>{apiError.violations.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      {apiError?.correlationId ? <small>Reference: {apiError.correlationId}</small> : null}
    </Alert>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return <div className="state-panel" role="status"><LoaderCircle className="spin" size={30} /><p>{label}…</p></div>;
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <div className="state-panel"><CircleOff size={34} /><h3>{title}</h3><p>{message}</p>{action}</div>;
}

export function QueryErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return <div className="stack"><ErrorAlert error={error} /><Button variant="secondary" onClick={onRetry}>Try again</Button></div>;
}
