import type { CSSProperties } from 'react';
import type { DesignSystem } from '../types';
import { tokenValue } from './tokens';

// App geometry and typography stay fixed; only colors follow the current preset.
export function appThemeColors(ds: DesignSystem): CSSProperties {
  const bindings = {
    '--app-canvas': 'color.background.page', '--app-surface': 'color.surface.default',
    '--app-subtle': 'color.surface.soft', '--app-text': 'color.text.primary',
    '--app-muted': 'color.text.secondary', '--app-border': 'color.border.default',
    '--app-brand': 'color.brand.primary', '--app-brand-strong': 'color.interactive.hover',
    '--app-on-brand': 'color.text.on-color', '--app-brand-soft': 'color.surface.tertiary',
    '--app-success': 'color.status.success', '--app-warning': 'color.status.warning',
    '--app-danger': 'color.status.danger', '--app-disabled': 'color.text.disabled',
  };
  return Object.fromEntries(Object.entries(bindings).map(([variable, token]) => [variable, tokenValue(ds, token)])) as CSSProperties;
}
