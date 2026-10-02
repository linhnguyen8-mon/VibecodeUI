import type { DesignSystem, DesignToken } from '../types';
import { resolvedTokens as legacyTokens } from './tokens';
import { getTypography, scaleTypography } from './typography';
import { getElevation, getLayout } from './layout';
import { getButtonSize, buttonSizeOrder } from './button';
import { getBadge } from './badge';
import { getSpacingAliases, getSpacingScale, spacingTokenNames } from './spacing';
import { referenceName, resolveTokenGraph } from './tokenGraph';

export type TokenGroup = 'Color' | 'Typography' | 'Layout' | 'Radius' | 'Elevation' | 'Component';
export const tokenGroups: TokenGroup[] = ['Color', 'Typography', 'Layout', 'Radius', 'Elevation', 'Component'];
export interface TokenDefinition {
  name: string; category: DesignToken['category']; group: TokenGroup;
  usedBy: string; layer: 'Primitive' | 'Semantic' | 'Component';
  path?: string[]; unit?: string; min?: number; max?: number;
}
// Existing names remain canonical. Foundation paths are ingestion/projection bindings,
// never a second editable store. No Cartesian product of naming modifiers is generated.
const registry = new Map<string, TokenDefinition>();
export function tokenDefinition(token: DesignToken): TokenDefinition {
  const known = registry.get(token.name);
  if (known) return known;
  let group: TokenGroup = token.category === 'color' ? 'Color' : token.category === 'typography' ? 'Typography' : token.category === 'radius' ? 'Radius' : token.category === 'shadow' ? 'Elevation' : 'Layout';
  if (/^(color|radius|shadow|spacing|typography)\.button\.|^radius\.button$|^control\.height\./.test(token.name)) group = 'Component';
  const numeric = (token.override ?? token.value).match(/^(-?\d+(?:\.\d+)?)(px)?$/);
  const layer = /\.(primary|secondary|tertiary|base|\d+)$/.test(token.name) && /color\.(brand|neutral)/.test(token.name) || /^spacing\.[A-Z0-9]+$/.test(token.name) ? 'Primitive' : 'Semantic';
  const definition: TokenDefinition = { name: token.name, category: token.category, group, layer: group === 'Component' ? 'Component' : layer, usedBy: group === 'Component' ? 'Button / component style' : token.name.startsWith('color.text') ? 'Text / content' : token.name.startsWith('color.border') ? 'Component borders' : token.name.startsWith('color.surface') ? 'Component surfaces' : token.name.startsWith('color.brand') ? 'Brand / interactive elements' : token.name.startsWith('spacing.') ? 'Layout / spacing' : token.name === 'radius.card' ? 'Card / corner radius' : token.name === 'shadow.card' ? 'Card / shadow' : 'Foundation preview', ...(numeric ? { unit: numeric[2] ?? '', min: 0, max: 9999 } : token.category === 'spacing' || token.category === 'radius' ? { unit: 'px', min: 0, max: 999 } : {}) };
  registry.set(token.name, definition);
  return definition;
}
const links: Record<string, string> = {
  'color.focus.ring': 'color.brand.primary', 'color.interactive.default': 'color.brand.primary',
  'color.interactive.focus': 'color.brand.primary', 'color.interactive.disabled': 'color.border.disabled',

};
function pathSet(target: Record<string, unknown>, path: string[], value: unknown) {
  let object = target;
  for (const key of path.slice(0, -1)) { if (!object[key] || typeof object[key] !== 'object') object[key] = {}; object = object[key] as Record<string, unknown>; }
  object[path[path.length - 1]] = value;
}
function foundationTokens(ds: DesignSystem): DesignToken[] {
  const f = ds.foundations;
  const complete = { ...f, typography: getTypography(ds), layout: getLayout(ds), elevation: getElevation(ds), buttonSizes: Object.fromEntries(buttonSizeOrder.map(size => [size, getButtonSize(ds, size)])), badge: getBadge(ds), spacingAliases: getSpacingAliases(ds), spacingScale: spacingTokenNames.map(name => getSpacingScale(ds)[name]) };
  const tokens: DesignToken[] = [];
  const walk = (value: unknown, path: string[]) => {
    if (value && typeof value === 'object') { Object.entries(value).forEach(([key, child]) => walk(child, [...path, key])); return; }
    if (value === undefined) return;
    // Linked numeric mirrors are projected from their owning source below.
    const key = path.join('.');
    if (['bodySize', 'headingSize'].includes(key) || /^layout\.(sectionGap|componentGap|cardPadding)$/.test(key)) return;
    if (/^(buttonSizes\.[SML]|badge)\.(paddingX|paddingY|iconPaddingLeft|iconPaddingRight|iconGap)$/.test(key)) {
      const parent = path[0] === 'badge' ? complete.badge : complete.buttonSizes[path[1]];
      const ref = (parent as unknown as Record<string, unknown>)[`${path.at(-1)}Token`];
      if (ref) return;
    }
    if (path[0] === 'spacingAliases' || path.at(-1)?.endsWith('Token')) return;
    const group: TokenGroup = path[0] === 'background' ? 'Color' : path[0] === 'typography' || path[0] === 'fontFamily' ? 'Typography' : path[0] === 'radiusScale' || key.startsWith('layout.') ? 'Radius' : path[0] === 'elevation' ? 'Elevation' : ['buttonSizes','badge'].includes(path[0]) ? 'Component' : 'Layout';
    let category: DesignToken['category'] = group === 'Typography' ? 'typography' : group === 'Radius' ? 'radius' : group === 'Elevation' ? 'shadow' : 'spacing';
    if (/(fontSize|fontWeight)$/.test(key)) category = 'typography';
    if (/radius$/.test(key)) category = 'radius';
    if (typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)) category = 'color';
    const name = path[0] === 'spacingScale' ? `spacing.${spacingTokenNames[Number(path[1])]}` : key === 'layout.cardRadius' ? 'radius.card' : key === 'layout.controlRadius' ? 'radius.control' : `foundation.${key}`;
    const unit = typeof value === 'number' && !/(ratio|weight|fontWeight|lineHeight|opacity|gradientAngle|zIndex|surfaceLevels)/.test(key) ? 'px' : '';
    registry.set(name, { name, group, category, path, unit, layer: group === 'Component' ? 'Component' : name === 'radius.card' || name === 'radius.control' || path[0] === 'typography' && path[1] === 'roles' ? 'Semantic' : 'Primitive', usedBy: `${path[0]} / ${path.slice(1).join(' / ') || 'all components'}`, ...(typeof value === 'number' ? { min: /(lineHeight|ratio)/.test(key) ? 0.5 : /elevation.*\.(x|y|spread)$/.test(key) ? -999 : 0, max: /opacity$/.test(key) ? 100 : /ratio$/.test(key) ? 2 : /lineHeight$/.test(key) ? 3 : /weight$/.test(key) ? 900 : 9999 } : {}) });
    tokens.push({ name, category, value: `${value}${unit}`, valueKind: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : category === 'color' ? 'color' : 'string', unit });
  };
  walk(complete, []);
  // Keep existing spacing names and links, rather than storing both numeric fields and aliases.
  const aliases = getSpacingAliases(ds);
  const aliasNames = { pageMargin: 'page.margin', containerPadding: 'container.padding', sectionGap: 'section.gap', componentGap: 'component.gap', cardPadding: 'card.padding', elementGap: 'element.gap' };
  for (const [key, suffix] of Object.entries(aliasNames)) tokens.push({ name: `spacing.${suffix}`, category: 'spacing', value: `ref:spacing.${aliases[key as keyof typeof aliases]}` });
  for (const size of buttonSizeOrder) {
    const button = getButtonSize(ds, size);
    for (const key of ['paddingX','paddingY','iconPaddingLeft','iconPaddingRight','iconGap'] as const) {
      const ref = button[`${key}Token`];
      if (!ref) continue;
      const name = `foundation.buttonSizes.${size}.${key}`;
      registry.set(name, { name, category: 'spacing', group: 'Component', layer: 'Component', path: ['buttonSizes',size,key], unit: 'px', min: 0, max: 999, usedBy: `Button ${size} / ${key}` });
      tokens.push({ name, category: 'spacing', value: `ref:spacing.${ref}`, valueKind: 'number', unit: 'px' });
    }
  }
  const badge = getBadge(ds);
  tokens.push({ name: 'foundation.badge.paddingX', category: 'spacing', value: `ref:spacing.${badge.paddingXToken}`, valueKind: 'number', unit: 'px' });
  registry.set('foundation.badge.paddingX', { name: 'foundation.badge.paddingX', category: 'spacing', group: 'Component', layer: 'Component', path: ['badge','paddingX'], unit: 'px', min: 0, max: 999, usedBy: 'Badge / padding' });
  // Radius mirrors refer to their established scale entry.
  for (const [name,index] of [['radius.control',1],['radius.card',2]] as const) {
    const scale = f.radiusScale[index];
    const token = tokens.find(t => t.name === name);
    if (token && scale !== undefined) { if (parseFloat(token.value) !== scale) token.override = token.value; token.value = `ref:foundation.radiusScale.${index}`; }
  }
  return tokens;
}

const inputColorLinks: Record<string, string> = {
  'color.input.default': 'color.surface.default',
  'color.input.selected': 'color.surface.tertiary',
  'color.input.hover': 'color.surface.soft',
  'color.input.disabled': 'color.border.disabled',
};
function withInputColors(tokens: DesignToken[]): DesignToken[] {
  const names = new Set(tokens.map(token => token.name));
  return [...tokens, ...Object.entries(inputColorLinks).filter(([name]) => !names.has(name)).map(([name, ref]) => ({ name, category: 'color' as const, value: `ref:${ref}`, valueKind: 'color' as const, unit: '' }))];
}

function withOverlayColors(tokens: DesignToken[]): DesignToken[] {
  const names = new Set(tokens.map(token => token.name));
  const sources = ['color.neutral.base', 'color.brand.primary', 'color.brand.secondary', 'color.brand.tertiary', 'color.status.success', 'color.status.danger', 'color.status.info'];
  const overlays: DesignToken[] = [];
  for (const source of sources.filter(source => names.has(source))) {
    const family = source === 'color.neutral.base' ? 'base' : source.replace('color.', '');
    for (const percent of [56, 48, 24, 16]) {
      const name = `color.overlay.${family}.${percent}`;
      registry.set(name, { name, category: 'color', group: 'Color', layer: 'Primitive', usedBy: 'Overlay / translucent source color' });
      if (!names.has(name)) overlays.push({ name, category: 'color', valueKind: 'color', value: `ref:${source}`, opacity: percent / 100 });
    }
  }
  return [...tokens, ...overlays];
}

export function normalizeDesignSystem(ds: DesignSystem): DesignSystem {
  if (ds.tokenModelVersion === 1) { foundationTokens(ds); return projectDesignSystem({ ...ds, tokens: withOverlayColors(withInputColors(ds.tokens)) }); }
  const foundations = foundationTokens(ds);
  const imported = new Map(ds.tokens.map(token => [token.name, token]));
  const generated = legacyTokens(ds);
  const merged = new Map(generated.map(token => [token.name, { ...token }]));
  for (const token of foundations) merged.set(token.name, token);
  for (const [name, ref] of Object.entries(links)) merged.set(name, { name, category: 'color', value: `ref:${ref}` });
  // Preserve explicit source colors and source references; generated colors remain derived.
  for (const token of imported.values()) if (token.category === 'color' && !links[token.name]) merged.set(token.name, { ...token });
  const fallbackLinks: Record<string,string> = { 'color.status.info':'color.brand.primary','color.border.selected':'color.brand.primary','color.background.page':'color.surface.soft','color.surface.elevated':'color.surface.default','color.text.link':'color.brand.primary','color.border.focus':'color.brand.primary' };
  for (const [name,ref] of Object.entries(fallbackLinks)) if (!imported.has(name) && merged.has(ref)) merged.set(name,{ name,category:'color',value:`ref:${ref}` });
  const componentBindings = { 'foundation.buttonSizes.M.height': 'control.height.md', 'foundation.buttonSizes.M.fontSize': 'typography.button.font-size', 'foundation.buttonSizes.M.fontWeight': 'typography.button.font-weight', 'foundation.buttonSizes.M.paddingX': 'spacing.button.padding-x', 'foundation.buttonSizes.M.paddingY': 'spacing.button.padding-y' };
  for (const [name,ref] of Object.entries(componentBindings)) if (imported.has(ref) && merged.has(name)) merged.set(name,{ ...merged.get(name)!, value: `ref:${ref}` });
  for (const token of merged.values()) { const meta = tokenDefinition(token); token.valueKind ??= token.category === 'color' ? 'color' : meta.unit || meta.min !== undefined ? 'number' : 'string'; token.unit ??= meta.unit ?? ''; }
  return projectDesignSystem({ ...ds, tokenModelVersion: 1, tokens: withOverlayColors(withInputColors([...merged.values()])) });
}

export function projectDesignSystem(ds: DesignSystem): DesignSystem {
  const values = resolveTokenGraph(ds.tokens);
  const foundations = structuredClone(ds.foundations) as unknown as Record<string, unknown>;
  for (const token of ds.tokens) {
    const definition = tokenDefinition(token);
    if (!definition.path) continue;
    const previous = definition.path.reduce<unknown>((value, key) => (value as Record<string,unknown> | undefined)?.[key], ds.foundations);
    const raw = values.get(token.name)!;
    const value = typeof previous === 'boolean' ? raw === 'true' : definition.unit || definition.min !== undefined ? parseFloat(raw) : raw;
    pathSet(foundations, definition.path, value);
  }
  const f = foundations as unknown as DesignSystem['foundations'];
  f.spacingAliases = getSpacingAliases(ds);
  f.bodySize = f.typography!.roles.Body.size;
  f.headingSize = f.typography!.roles.H2.size;
  const aliasNames = { pageMargin: 'page.margin', containerPadding: 'container.padding', sectionGap: 'section.gap', componentGap: 'component.gap', cardPadding: 'card.padding', elementGap: 'element.gap' };
  for (const [key,suffix] of Object.entries(aliasNames)) {
    const token = ds.tokens.find(t => t.name === `spacing.${suffix}`);
    const ref = referenceName(token?.override ?? token?.value ?? '');
    if (ref && spacingTokenNames.includes(ref.slice(8) as typeof spacingTokenNames[number])) f.spacingAliases![key as keyof NonNullable<typeof f.spacingAliases>] = ref.slice(8) as typeof spacingTokenNames[number];
  }
  return { ...ds, foundations: f };
}

export function editDesignToken(ds: DesignSystem, name: string, value: string, mode: 'master' | 'override' = 'override'): DesignSystem {
  const canonical = normalizeDesignSystem(ds);
  const token = canonical.tokens.find(t => t.name === name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const definition = tokenDefinition(token);
  const ref = referenceName(value);
  const sourceRef = referenceName(token.value);
  // Imported component names keep ownership; foundation bindings are aliases,
  // so master edits update the original owner rather than introducing a mirror.
  if (mode === 'master' && !ref && sourceRef && name.startsWith('foundation.buttonSizes.M.') && /^(control\.height\.md|typography\.button\.|spacing\.button\.)/.test(sourceRef)) return editDesignToken(canonical,sourceRef,value,'master');
  if (ref && /^color\.(brand\.(primary|secondary|tertiary)|neutral\.base)$/.test(name)) {
    const prefix = name === 'color.neutral.base' ? 'color.neutral.' : `${name}.`;
    if (ref.startsWith(prefix) && /\.\d+$/.test(ref)) throw new Error('Reference cycle: a seed cannot reference its generated shade.');
  }
  if (!ref) {
    if (token.category === 'color' && !/^(#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})|rgba?\([^()]+\)|hsla?\([^()]+\))$/i.test(value)) throw new Error('Enter a valid color or reference.');
    if (token.category === 'color' && typeof CSS !== 'undefined' && !CSS.supports('color',value)) throw new Error('Enter a valid CSS color.');
    if (token.valueKind === 'number' && !token.unit && !/^-?\d+(\.\d+)?$/.test(value)) throw new Error('Use a unitless number.');
    if (definition.unit && !new RegExp(`^-?\\d+(\\.\\d+)?${definition.unit}$`).test(value)) throw new Error(`Use a number in ${definition.unit}.`);
    if (definition.unit || definition.min !== undefined) { const n = parseFloat(value); if (!Number.isFinite(n) || n < (definition.min ?? 0) || n > (definition.max ?? 9999)) throw new Error('Value is outside the supported range.'); }
    if (token.valueKind === 'boolean' && !['true','false'].includes(value)) throw new Error('Choose true or false.');
    if (name === 'foundation.contentWidth' && !/^(\d+(\.\d+)?(px|rem|em|%)|none)$/.test(value)) throw new Error('Use px, rem, em, % or none.');
    if (token.category === 'shadow' && !definition.path && value !== 'none' && !(typeof CSS !== 'undefined' ? CSS.supports('box-shadow',value) : /^(inset\s+)?(?:(?:-?\d+(?:\.\d+)?px|0)\s+){2,4}(rgba?\([^()]+\)|#[\da-f]{3,8})$/i.test(value))) throw new Error('Enter a valid CSS shadow.');
    if (!value.trim()) throw new Error('Value is required.');
    const enumerations: Record<string,string[]> = { 'foundation.background.mode': ['light','soft','gradient'], 'foundation.contrastMode': ['standard','enhanced'] };
    if (enumerations[name] && !enumerations[name].includes(value)) throw new Error(`Choose ${enumerations[name].join(', ')}.`);
    if (/density$/.test(name) && !['compact','comfortable','spacious'].includes(value)) throw new Error('Choose compact, comfortable or spacious.');
  }
  let next = { ...canonical, tokens: canonical.tokens.map(t => t.name === name ? mode === 'master' ? { ...t, value } : { ...t, override: value } : t) };
  resolveTokenGraph(next.tokens); // Reject unknown, mismatched and cyclic references before changing state.
  if (mode === 'master' && ['foundation.typography.roles.Body.size','foundation.typography.ratio'].includes(name)) {
    const values = resolveTokenGraph(next.tokens);
    const base = parseFloat(values.get('foundation.typography.roles.Body.size')!);
    const ratio = parseFloat(values.get('foundation.typography.ratio')!);
    const roles = scaleTypography(base, ratio);
    next.tokens = next.tokens.map(t => { const role = t.name.match(/^foundation\.typography\.roles\.(.+)\.size$/)?.[1] as keyof typeof roles; return role && roles[role] ? { ...t, value: `${roles[role].size}px` } : t; });
  }
  next = projectDesignSystem(next);
  // Reuse the existing deterministic color scale rules, retaining local overrides.
  const resolved = resolveTokenGraph(next.tokens);
  const generated = legacyTokens({ ...next, tokenModelVersion: undefined, tokens: next.tokens.map(t => ({ ...t, value: resolved.get(t.name)!, override: undefined })) });
  const generatedValues = new Map(generated.map(t => [t.name,t.value]));
  next.tokens = next.tokens.map(t => /^color\.(brand\.(primary|secondary|tertiary)|neutral)\.\d+$/.test(t.name) || ['color.interactive.hover','color.interactive.active','color.border.hover','shadow.card'].includes(t.name) ? { ...t, value: generatedValues.get(t.name) ?? t.value } : t);
  return projectDesignSystem(next);
}
export function restoreDesignToken(ds: DesignSystem, name: string): DesignSystem {
  const restored = projectDesignSystem({ ...ds, tokens: ds.tokens.map(token => token.name === name ? { ...token, override: undefined } : token) });
  const token = restored.tokens.find(t => t.name === name);
  return token ? editDesignToken(restored,name,token.value,'master') : restored;
}
