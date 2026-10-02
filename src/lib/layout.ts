import { resolveTokenGraph } from "./tokenGraph";
import type { ComponentLayout, DesignSystem, ElevationLevel } from "../types";
import { getSpacingAliases, spacingValue } from "./spacing";

export const defaultLayout: ComponentLayout = {
  sectionGap: 32,
  componentGap: 8,
  cardPadding: 22,
  controlRadius: 8,
  cardRadius: 12,
};

export const defaultElevation: ElevationLevel[] = [
  { x: 0, y: 0, blur: 0, spread: 0, opacity: 0, color: "#000000", zIndex: 0 },
  { x: 0, y: 1, blur: 3, spread: 0, opacity: 5, color: "#000000", zIndex: 10 },
  { x: 0, y: 2, blur: 10, spread: 0, opacity: 8, color: "#000000", zIndex: 20 },
  { x: 0, y: 8, blur: 20, spread: 0, opacity: 10, color: "#000000", zIndex: 30 },
  { x: 0, y: 12, blur: 30, spread: 0, opacity: 15, color: "#000000", zIndex: 40 },
];

export const elevationLabels = ["Flat", "Low", "Medium", "High", "Overlay"];

export function getLayout(ds: DesignSystem): ComponentLayout {
  const spacing = getSpacingAliases(ds);
  const values = ds.tokenModelVersion === 1 ? resolveTokenGraph(ds.tokens) : new Map<string,string>();
  return {
    ...defaultLayout,
    controlRadius: ds.foundations.radiusScale[1] ?? defaultLayout.controlRadius,
    cardRadius: ds.foundations.radiusScale[2] ?? defaultLayout.cardRadius,
    ...ds.foundations.layout,
    sectionGap: spacingValue(ds, spacing.sectionGap),
    componentGap: spacingValue(ds, spacing.componentGap),
    cardPadding: spacingValue(ds, spacing.cardPadding),
    ...Object.fromEntries([["sectionGap","spacing.section.gap"],["componentGap","spacing.component.gap"],["cardPadding","spacing.card.padding"],["controlRadius","radius.control"],["cardRadius","radius.card"]].filter(([,name]) => values.has(name)).map(([key,name]) => [key, parseFloat(values.get(name)!)])),
  };
}

export function getElevation(ds: DesignSystem): ElevationLevel[] {
  return defaultElevation.map((level, index) => ({ ...level, ...ds.foundations.elevation?.[index] }));
}

export function elevationCss(level: ElevationLevel): string {
  if (level.opacity === 0) return "none";
  const hex = /^#[0-9a-f]{6}$/i.test(level.color) ? level.color : "#000000";
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16));
  return `${level.x}px ${level.y}px ${level.blur}px ${level.spread}px rgba(${channels.join(", ")}, ${(level.opacity / 100).toFixed(2)})`;
}
