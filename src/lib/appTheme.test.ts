import { describe, expect, it } from 'vitest';
import { designSystems } from '../data/libraryData';
import { normalizeDesignSystem, editDesignToken } from './designTokens';
import { appThemeColors } from './appTheme';
import { tokenValue } from './tokens';

describe('app preset colors', () => {
  it('maps every preset to color-only variables without changing app geometry', () => {
    for (const source of designSystems) {
      const ds = normalizeDesignSystem(source);
      const colors = appThemeColors(ds) as Record<string,string>;
      expect(colors['--app-brand']).toBe(tokenValue(ds, 'color.brand.primary'));
      expect(colors['--app-surface']).toBe(tokenValue(ds, 'color.surface.default'));
      expect(Object.keys(colors).some(key => /spacing|radius|font|width|height|density/.test(key))).toBe(false);
    }
  });
  it('uses current edits and isolates other presets', () => {
    const initial = normalizeDesignSystem(designSystems[0]);
    const other = appThemeColors(normalizeDesignSystem(designSystems[1]));
    const edited = editDesignToken(initial, 'color.brand.primary', '#123456', 'master');
    expect((appThemeColors(edited) as Record<string,string>)['--app-brand']).toBe('#123456');
    expect(appThemeColors(normalizeDesignSystem(designSystems[1]))).toEqual(other);
  });
});
