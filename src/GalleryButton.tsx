import type { ButtonHTMLAttributes, Ref } from 'react';

export function GalleryButton({ children, variant = 'primary', className = '', ref, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; ref?: Ref<HTMLButtonElement> }) {
  return <button type="button" {...props} ref={ref} className={`eg-button eg-${variant} ${className}`}>{children}</button>;
}
