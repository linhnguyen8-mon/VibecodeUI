import type { HTMLAttributes, Ref } from 'react';

export function GalleryBadge({ children, variant = 'primary', className = '', ref, ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: string; ref?: Ref<HTMLSpanElement> }) {
  return <span {...props} ref={ref} className={`eg-badge eg-${variant} ${className}`}>{children}</span>;
}
