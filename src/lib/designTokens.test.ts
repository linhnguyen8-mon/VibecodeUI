import { describe, it, expect } from 'vitest';
import { designSystems } from '../data/libraryData';
import { normalizeDesignSystem, editDesignToken, restoreDesignToken } from './designTokens';
import { resolvedTokens, tokenValue } from './tokens';
import { getLayout, getElevation, elevationCss } from './layout';
import { getButtonSize } from './button';
import { getTypography } from './typography';
import { createDesignSystemPrompt } from './library';
import { resolveTokenGraph } from './tokenGraph';

describe('canonical design token editor', () => {
  it('links input semantic states and synchronizes overrides with the prompt', () => {
    for (const source of designSystems) {
      let ds = normalizeDesignSystem(source);
      const links = { default: 'color.surface.default', selected: 'color.surface.tertiary', hover: 'color.surface.soft', disabled: 'color.border.disabled' };
      for (const [state, ref] of Object.entries(links)) {
        const name = `color.input.${state}`;
        expect(ds.tokens.find(t => t.name === name)?.value).toBe(`ref:${ref}`);
        expect(tokenValue(ds, name)).toBe(tokenValue(ds, ref));
        const edited = editDesignToken(ds, name, '#123456');
        expect(tokenValue(edited, name)).toBe('#123456');
        expect(createDesignSystemPrompt(edited)).toContain(`${name}: #123456`);
        expect(tokenValue(restoreDesignToken(edited, name), name)).toBe(tokenValue(ds, ref));
      }
      ds = editDesignToken(ds, 'color.surface.default', '#ABCDEF', 'master');
      expect(tokenValue(ds, 'color.input.default')).toBe('#ABCDEF');
      const oldCanonical = { ...ds, tokens: ds.tokens.filter(t => !t.name.startsWith('color.input.')) };
      expect(normalizeDesignSystem(oldCanonical).tokens.filter(t => t.name.startsWith('color.input.'))).toHaveLength(4);
    }
  });

  it('normalizes every existing preset without changing rendered foundation values', () => {
    for (const source of designSystems) {
      const ds = normalizeDesignSystem(source);
      expect(getLayout(ds)).toEqual(getLayout(source));
      expect(getTypography(ds)).toEqual(getTypography(source));
      expect(getElevation(ds)).toEqual(getElevation(source));
      expect(getButtonSize(ds,'M')).toEqual(getButtonSize(source,'M'));
      for (const token of source.tokens.filter(t => t.category === 'color')) expect(tokenValue(ds,token.name), `${source.id} ${token.name}`).toBe(tokenValue(source,token.name));
      expect(new Set(ds.tokens.map(t => t.name)).size).toBe(ds.tokens.length);
    }
  });
  const cases = [
    ['color.brand.primary','#123456', (ds: typeof designSystems[number]) => tokenValue(ds,'color.brand.primary')],
    ['foundation.typography.roles.Body.size','19px', (ds: typeof designSystems[number]) => `${getTypography(ds).roles.Body.size}px`],
    ['spacing.component.gap','23px', (ds: typeof designSystems[number]) => `${getLayout(ds).componentGap}px`],
    ['radius.card','17px', (ds: typeof designSystems[number]) => `${getLayout(ds).cardRadius}px`],
    ['foundation.elevation.1.blur','13px', (ds: typeof designSystems[number]) => `${getElevation(ds)[1].blur}px`],
    ['foundation.buttonSizes.M.height','47px', (ds: typeof designSystems[number]) => `${getButtonSize(ds,'M').height}px`],
  ] as const;
  for (const [name,value,preview] of cases) it(`synchronizes master and table edits: ${name}`, () => {
    const source = normalizeDesignSystem(designSystems[0]);
    for (const mode of ['master','override'] as const) {
      const next = editDesignToken(source,name,value,mode);
      expect(resolveTokenGraph(next.tokens).get(name)).toBe(value);
      expect(preview(next)).toBe(value);
      expect(createDesignSystemPrompt(next)).toContain(`${name}: ${value}`);
      expect(normalizeDesignSystem(next).tokens).toEqual(next.tokens);
      expect(source.tokens.find(t => t.name === name)?.override).toBeUndefined();
    }
  });
  it('keeps overrides during master edits and restores the current link', () => {
    let ds = normalizeDesignSystem(designSystems[0]);
    ds = editDesignToken(ds,'color.interactive.default','#778899');
    ds = editDesignToken(ds,'color.brand.primary','#112233','master');
    expect(tokenValue(ds,'color.interactive.default')).toBe('#778899');
    expect(tokenValue(ds,'color.interactive.focus')).toBe('#112233');
    ds = restoreDesignToken(ds,'color.interactive.default');
    expect(tokenValue(ds,'color.interactive.default')).toBe('#112233');
    expect(ds.tokens.find(t => t.name === 'color.interactive.default')?.override).toBeUndefined();
  });
  it('rejects missing, wrong-category and cyclic references without mutating state', () => {
    const ds = normalizeDesignSystem(designSystems[0]);
    const before = JSON.stringify(ds);
    expect(() => editDesignToken(ds,'color.brand.primary','ref:missing')).toThrow(/Missing reference/);
    expect(() => editDesignToken(ds,'color.brand.primary','ref:spacing.M')).toThrow(/type mismatch/);
    expect(() => editDesignToken(ds,'color.brand.primary','ref:color.interactive.default')).toThrow(/cycle/);
    expect(() => editDesignToken(ds,'radius.card','17rem')).toThrow(/px/);
    expect(JSON.stringify(ds)).toBe(before);
  });
  it('regenerates brand shades while preserving shade overrides', () => {
    const ds = editDesignToken(normalizeDesignSystem(designSystems[0]),'color.brand.primary.500','#abcdef');
    const next = editDesignToken(ds,'color.brand.primary','#123456','master');
    expect(tokenValue(next,'color.brand.primary.500')).toBe('#abcdef');
    expect(tokenValue(next,'color.brand.primary.600')).toBe('#123456'.toUpperCase());
    expect(resolvedTokens(next).find(t => t.name === 'color.interactive.default')?.value).toBe('#123456');
  });
  it('keeps drafts isolated and serializable', () => {
    const a = normalizeDesignSystem(designSystems[0]);
    const b = normalizeDesignSystem(designSystems[1]);
    const edited = editDesignToken(a,'radius.card','27px');
    expect(getLayout(normalizeDesignSystem(JSON.parse(JSON.stringify(edited))))).toEqual(getLayout(edited));
    expect(getLayout(b)).toEqual(getLayout(designSystems[1]));
    expect(getLayout(a).cardRadius).not.toBe(27);
  });
  it('preserves fractional units and unrelated tokens', () => {
    const ds = normalizeDesignSystem(designSystems[0]);
    const next = editDesignToken(ds,'radius.card','17.25px');
    expect(getLayout(next).cardRadius).toBe(17.25);
    expect(createDesignSystemPrompt(next)).toContain('radius.card: 17.25px');
    for (const token of ds.tokens.filter(t => t.name !== 'radius.card')) expect(next.tokens.find(t => t.name === token.name)).toEqual(token);
  });
  it('updates computed shadows and component padding and removes stale prompt mappings', () => {
    let ds = editDesignToken(normalizeDesignSystem(designSystems[0]),'foundation.elevation.1.blur','13px','master');
    expect(tokenValue(ds,'shadow.card')).toContain('13px');
    ds = editDesignToken(ds,'foundation.buttonSizes.M.paddingX','23px');
    expect(getButtonSize(ds,'M').paddingX).toBe(23);
    expect(createDesignSystemPrompt(ds)).toContain('horizontal padding');
    expect(createDesignSystemPrompt(ds)).toContain('padding {spacing.S} (8px) 23px');
  });
  it('uses existing Elevo component values and supports edits without renderer constants', () => {
    let ds = normalizeDesignSystem(designSystems.find(ds => ds.id === 'ds-learning-bright')!);
    expect(getButtonSize(ds,'M').height).toBe(52);
    expect(getButtonSize(ds,'M').fontSize).toBe(16);
    expect(getButtonSize(ds,'M').paddingY).toBe(14);
    ds = editDesignToken(ds,'foundation.buttonSizes.M.height','61px','master');
    expect(getButtonSize(ds,'M').height).toBe(61);
    expect(tokenValue(ds,'control.height.md')).toBe('61px');
    expect(ds.tokens.find(t => t.name === 'foundation.buttonSizes.M.height')?.value).toBe('ref:control.height.md');
    ds = editDesignToken(ds,'color.brand.primary','#112233','master');
    expect(createDesignSystemPrompt(ds)).not.toContain('primary #59C8FF');
  });
  it('updates typography scale without erasing a role override', () => {
    let ds = editDesignToken(normalizeDesignSystem(designSystems[0]),'foundation.typography.roles.H1.size','57px');
    ds = editDesignToken(ds,'foundation.typography.roles.Body.size','18px','master');
    expect(getTypography(ds).roles.H1.size).toBe(57);
    expect(getTypography(ds).roles.Body.size).toBe(18);
    expect(elevationCss(getElevation(ds)[1])).toBeTruthy();
  });
});
