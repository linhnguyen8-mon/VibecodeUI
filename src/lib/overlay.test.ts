import { expect, it } from 'vitest';
import { designSystems } from '../data/libraryData';
import { normalizeDesignSystem, editDesignToken } from './designTokens';
import { resolveTokenGraph } from './tokenGraph';
import { createDesignSystemPrompt } from './library';
it('creates four linked opacity levels and keeps edits synchronized for every preset', () => {
  for (const preset of designSystems) {
    const ds = normalizeDesignSystem(preset);
    for (const percent of [56,48,24,16]) {
      expect(resolveTokenGraph(ds.tokens).get(`color.overlay.brand.primary.${percent}`)).toContain(`${percent}%`);
    }
    const edited = editDesignToken(ds,'color.brand.primary','#123456','master');
    expect(resolveTokenGraph(edited.tokens).get('color.overlay.brand.primary.56')).toBe('color-mix(in srgb, #123456 56%, transparent)');
    expect(createDesignSystemPrompt(edited)).toContain('color-mix(in srgb, #123456 56%, transparent)');
    expect(normalizeDesignSystem(ds).tokens.length).toBe(ds.tokens.length);
  }
});
