import type { PropsWithChildren } from 'react';

type FormFieldProps = PropsWithChildren<{
  label: string;
  error?: string;
}>;

export const FormField = ({ label, error, children }: FormFieldProps) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium">{label}</span>
    {children}
    <span className="text-xs text-rose-500">{error}</span>
  </label>
);
