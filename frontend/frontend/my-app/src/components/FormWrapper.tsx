import { type FormHTMLAttributes, type ReactNode } from 'react';

/* ─────────────────────────────────────────────
   FORM WRAPPER — Standardized form container
   Handles submit prevention, consistent spacing
───────────────────────────────────────────── */

interface FormWrapperProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: () => void;
  children: ReactNode;
  gap?: number;
}

export default function FormWrapper({
  onSubmit,
  children,
  gap = 24,
  style,
  ...props
}: FormWrapperProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...style,
      }}
      {...props}
    >
      {children}
    </form>
  );
}
