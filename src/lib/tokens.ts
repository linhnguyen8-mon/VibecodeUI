import type { DesignSystem, DesignToken } from "../types";
import { elevationCss, getElevation, getLayout } from "./layout";
import { getSpacingAliases, getSpacingScale, spacingReference, spacingTokenNames } from "./spacing";

export const brandShadeSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function brandScale(hex: string): string[] {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return brandShadeSteps.map(() => hex);
  const [r, g, b] = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = delta === 0 ? 0 : max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  // The source color is the 600 stop. Every other stop eases toward white or
  // black with a monotonic lightness curve so adjacent swatches never jump.
  const lightnessByStep: Record<number, number> = { 50: .97, 100: .93, 200: .86, 300: .76, 400: .64, 500: .54, 600: lightness, 700: .38, 800: .28, 900: .18, 950: .10 };
  const convert = (l: number, saturationScale: number) => {
    const c = (1 - Math.abs(2 * l - 1)) * Math.max(0, Math.min(1, saturation * saturationScale)), x = c * (1 - Math.abs((hue / 60) % 2 - 1)), m = l - c / 2;
    const rgb = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
    return `#${rgb.map(channel => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  };
  return brandShadeSteps.map(step => {
    if (step === 600) return hex.toUpperCase();
    const target = lightnessByStep[step];
    const lightnessStop = step < 600 ? Math.max(target, lightness + (1 - lightness) * .12) : Math.min(target, lightness - Math.max(.04, lightness * .08));
    return convert(Math.max(.02, Math.min(.98, lightnessStop)), step < 600 ? .9 : .82);
  });
}

export function neutralScale(hex: string): Array<{ step: number; value: string }> {
  const values = brandScale(hex);
  return brandShadeSteps.map((step, index) => ({ step, value: values[index] }));
}

export function brandScales(ds: DesignSystem): Array<{ brand: string; shades: Array<{ step: number; value: string }> }> {
  const brands = ["primary", "secondary", "tertiary"].filter((brand, index) => index === 0 || ds.tokens.some(token => token.name === `color.brand.${brand}`));
  return brands.map(brand => {
    const seed = tokenValue(ds, `color.brand.${brand}`, brand === "primary" ? "#2457C5" : "#0891B2");
    const scale = brandScale(seed);
    return { brand, shades: brandShadeSteps.map((step, index) => ({ step, value: scale[index] })) };
  });
}

export function neutralScaleForSystem(ds: DesignSystem): Array<{ step: number; value: string }> {
  return neutralScale(tokenValue(ds, "color.neutral.base", "#64748B"));
}

export function functionalScales(ds: DesignSystem): Array<{ brand: string; shades: Array<{ step: number; value: string }> }> {
  const functional = [
    ["success", "color.status.success", "#16A34A"],
    ["warning", "color.status.warning", "#D97706"],
    ["danger", "color.status.danger", "#DC2626"],
    ["info", "color.status.info", "#2457C5"],
  ] as const;
  return functional.map(([brand, token, fallback]) => {
    const values = brandScale(tokenValue(ds, token, fallback));
    return { brand, shades: brandShadeSteps.map((step, index) => ({ step, value: values[index] })) };
  });
}

export const semanticTokenDefaults: DesignToken[] = [
  { name: "color.neutral.base", category: "color", value: "#64748B" },
  { name: "color.brand.tertiary", category: "color", value: "#7C3AED" },
  { name: "color.surface.tertiary", category: "color", value: "#FFFFFF" },
  { name: "color.status.success", category: "color", value: "#16A34A" },
  { name: "color.status.warning", category: "color", value: "#D97706" },
  { name: "color.status.danger", category: "color", value: "#DC2626" },
  { name: "color.text.secondary", category: "color", value: "#64748B" },
  { name: "color.text.disabled", category: "color", value: "#A3AEC0" },
  { name: "color.text.on-color", category: "color", value: "#FFFFFF" },
  { name: "color.border.divider", category: "color", value: "#F1F5F9" },
  { name: "color.border.disabled", category: "color", value: "#EEF1F6" },
  { name: "color.overlay.scrim", category: "color", value: "#101828" },
  { name: "color.background.gradient-start", category: "color", value: "#2457C5" },
  { name: "color.background.gradient-end", category: "color", value: "#0891B2" },
];

function mixHex(first: string, second: string, firstWeight: number): string {
  const valid = /^#[0-9a-f]{6}$/i;
  if (!valid.test(first) || !valid.test(second)) return first;
  const channel = (hex: string, offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16);
  const weight = Math.max(0, Math.min(1, firstWeight));
  return `#${[1, 3, 5].map(offset => Math.round(channel(first, offset) * weight + channel(second, offset) * (1 - weight)).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function tokenValue(ds: DesignSystem, name: string, fallback?: string): string {
  if (name === "color.focus.ring") return tokenValue(ds, "color.brand.primary", "#2457C5");
  if (name === "color.interactive.default" || name === "color.interactive.focus") return tokenValue(ds, "color.brand.primary", "#2457C5");
  if (name === "color.interactive.hover") return mixHex(tokenValue(ds, "color.brand.primary", "#2457C5"), "#000000", 0.92);
  if (name === "color.interactive.active") return mixHex(tokenValue(ds, "color.brand.primary", "#2457C5"), "#000000", 0.82);
  if (name === "color.interactive.disabled") return tokenValue(ds, "color.border.disabled", "#EEF1F6");
  const direct = ds.tokens.find(token => token.name === name)?.value;
  if (direct !== undefined) {
    const reference = direct.match(/^ref:(.+)$/)?.[1];
    if (reference && reference !== name) return tokenValue(ds, reference, fallback);
    return direct;
  }
  if (name === "color.brand.secondary" || name === "color.status.info" || name === "color.border.selected") {
    return tokenValue(ds, "color.brand.primary", "#2457C5");
  }
  if (name === "color.background.page") return tokenValue(ds, "color.surface.soft", "#F8FAFC");
  if (name === "color.surface.elevated") return tokenValue(ds, "color.surface.default", "#FFFFFF");
  if (name === "color.text.link" || name === "color.focus.ring") return tokenValue(ds, "color.brand.primary", "#2457C5");
  if (name === "color.border.hover") return mixHex(tokenValue(ds, "color.brand.primary", "#2457C5"), tokenValue(ds, "color.border.default", "#E2E8F0"), 0.35);
  if (name === "color.border.focus") return tokenValue(ds, "color.brand.primary", "#2457C5");
  const neutralMatch = name.match(/^color\.neutral\.(50|100|200|300|400|500|600|700|800|900|950)$/);
  if (neutralMatch) {
    const step = Number(neutralMatch[1]);
    const generated = neutralScaleForSystem(ds).find(item => item.step === step)?.value;
    if (generated) return generated;
  }
  const defaultValue = semanticTokenDefaults.find(token => token.name === name)?.value;
  if (defaultValue !== undefined) return defaultValue;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing token ${name}`);
}

export function resolvedTokens(ds: DesignSystem): DesignToken[] {
  const layout = getLayout(ds);
  const elevation = getElevation(ds);
  const spacingScale = getSpacingScale(ds);
  const spacingAliases = getSpacingAliases(ds);
  const derived = new Map<string, { value: string; category: DesignToken["category"] }>([
    ["radius.card", { value: `${layout.cardRadius}px`, category: "radius" }],
    ["spacing.page.margin", { value: spacingReference(spacingAliases.pageMargin), category: "spacing" }],
    ["spacing.container.padding", { value: spacingReference(spacingAliases.containerPadding), category: "spacing" }],
    ["spacing.section.gap", { value: spacingReference(spacingAliases.sectionGap), category: "spacing" }],
    ["spacing.component.gap", { value: spacingReference(spacingAliases.componentGap), category: "spacing" }],
    ["spacing.card.padding", { value: spacingReference(spacingAliases.cardPadding), category: "spacing" }],
    ["spacing.element.gap", { value: spacingReference(spacingAliases.elementGap), category: "spacing" }],
    ["shadow.card", { value: elevationCss(elevation[1]), category: "shadow" }],
    ["color.interactive.default", { value: tokenValue(ds, "color.interactive.default"), category: "color" }],
    ["color.interactive.hover", { value: tokenValue(ds, "color.interactive.hover"), category: "color" }],
    ["color.interactive.active", { value: tokenValue(ds, "color.interactive.active"), category: "color" }],
    ["color.interactive.focus", { value: tokenValue(ds, "color.interactive.focus"), category: "color" }],
    ["color.interactive.disabled", { value: tokenValue(ds, "color.interactive.disabled"), category: "color" }],
    ...spacingTokenNames.map(name => [`spacing.${name}`, { value: `${spacingScale[name]}px`, category: "spacing" }] as const),
  ]);
  const base = ds.tokens.filter(token => !/^spacing\.\d+$/.test(token.name)).map(token => derived.has(token.name) ? { ...token, ...derived.get(token.name)! } : token);
  const generatedBrandTokens = brandScales(ds).flatMap(({ brand, shades }) => shades.map(({ step, value }) => ({ name: `color.brand.${brand}.${step}`, category: "color" as const, value })));
  const generatedNeutralTokens = neutralScaleForSystem(ds).map(({ step, value }) => ({ name: `color.neutral.${step}`, category: "color" as const, value }));
  for (const [name, value] of derived) if (!base.some(token => token.name === name)) base.push({ name, ...value });
  const names = new Set(base.map(token => token.name));
  const defaults = semanticTokenDefaults.filter(token => {
    if (token.name === "color.brand.tertiary") return false;
    return !names.has(token.name);
  });
  const linked = ([
    { name: "color.status.info", category: "color", value: tokenValue(ds, "color.status.info") },
    { name: "color.border.selected", category: "color", value: tokenValue(ds, "color.border.selected") },
    { name: "color.background.page", category: "color", value: tokenValue(ds, "color.background.page") },
    { name: "color.surface.elevated", category: "color", value: tokenValue(ds, "color.surface.elevated") },
    { name: "color.text.link", category: "color", value: tokenValue(ds, "color.text.link") },
    { name: "color.interactive.default", category: "color", value: tokenValue(ds, "color.interactive.default") },
    { name: "color.interactive.hover", category: "color", value: tokenValue(ds, "color.interactive.hover") },
    { name: "color.interactive.active", category: "color", value: tokenValue(ds, "color.interactive.active") },
    { name: "color.interactive.focus", category: "color", value: tokenValue(ds, "color.interactive.focus") },
    { name: "color.interactive.disabled", category: "color", value: tokenValue(ds, "color.interactive.disabled") },
    { name: "color.border.hover", category: "color", value: tokenValue(ds, "color.border.hover") },
    { name: "color.border.focus", category: "color", value: tokenValue(ds, "color.border.focus") },
    { name: "color.focus.ring", category: "color", value: tokenValue(ds, "color.focus.ring") },
  ] satisfies DesignToken[]).filter(token => !names.has(token.name));
  return [...base, ...defaults, ...linked, ...generatedBrandTokens, ...generatedNeutralTokens];
}

export function setToken(tokens: DesignToken[], name: string, value: string, category: DesignToken["category"]): DesignToken[] {
  const found = tokens.some(token => token.name === name);
  return found
    ? tokens.map(token => token.name === name ? { ...token, value, category } : token)
    : [...tokens, { name, value, category }];
}
