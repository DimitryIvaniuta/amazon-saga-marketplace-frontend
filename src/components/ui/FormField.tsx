import { clsx } from 'clsx';
import { cloneElement, isValidElement, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface DescribedControlProps {
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
}

interface FieldFrameProps {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}

export function FieldFrame({ label, htmlFor, error, hint, children }: FieldFrameProps) {
  const descriptionId = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;
  let control = children;
  if (descriptionId && isValidElement<DescribedControlProps>(children)) {
    const accessibility: DescribedControlProps = { 'aria-describedby': descriptionId };
    if (error) accessibility['aria-errormessage'] = descriptionId;
    control = cloneElement(children, accessibility);
  }

  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {control}
      {error ? <p id={descriptionId} className="field__error" role="alert">{error}</p> : hint ? <p id={descriptionId} className="field__hint">{hint}</p> : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return <input className={clsx('input', invalid && 'input--invalid', className)} aria-invalid={invalid || undefined} {...props} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, ...props }: SelectProps) {
  return <select className={clsx('input', invalid && 'input--invalid', className)} aria-invalid={invalid || undefined} {...props} />;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return <textarea className={clsx('input', 'textarea', invalid && 'input--invalid', className)} aria-invalid={invalid || undefined} {...props} />;
}
