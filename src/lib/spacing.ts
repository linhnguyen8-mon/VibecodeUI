import type { DesignSystem, SpacingAliases, SpacingTokenName } from "../types";

export const spacingTokenNames: SpacingTokenName[] = ["XS", "S", "M", "L", "XL", "1XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
export const defaultSpacingValues = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];

export const semanticSpacingColors = {
  pageMargin: "#8B5CF6",
  containerPadding: "#06B6D4",
  sectionGap: "#F59E0B",
  componentGap: "#10B981",
  cardPadding: "#EC4899",
  elementGap: "#3B82F6",
} as const;

export const defaultSpacingAliases: SpacingAliases = {
  pageMargin: "3XL",
  containerPadding: "L",
  sectionGap: "2XL",
  componentGap: "S",
  cardPadding: "1XL",
  elementGap: "M",
};

export function getSpacingScale(ds: DesignSystem): Record<SpacingTokenName, number> {
  return Object.fromEntries(spacingTokenNames.map((name, index) => [name, ds.foundations.spacingScale[index] ?? defaultSpacingValues[index]])) as Record<SpacingTokenName, number>;
}

export function getSpacingAliases(ds: DesignSystem): SpacingAliases {
  return { ...defaultSpacingAliases, ...ds.foundations.spacingAliases };
}

export function spacingValue(ds: DesignSystem, name: SpacingTokenName): number {
  return getSpacingScale(ds)[name];
}

export function nearestSpacingToken(ds: DesignSystem, value: number): SpacingTokenName {
  const scale = getSpacingScale(ds);
  return spacingTokenNames.reduce((nearest, name) => Math.abs(scale[name] - value) < Math.abs(scale[nearest] - value) ? name : nearest, spacingTokenNames[0]);
}

export function spacingReference(name: SpacingTokenName): string {
  return `{spacing.${name}}`;
}
