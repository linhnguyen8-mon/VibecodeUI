import type { DesignSystem } from "../types";

export type Typography = NonNullable<DesignSystem["foundations"]["typography"]>;
export type TypeRole = keyof Typography["roles"];

export const typeRoles: TypeRole[] = ["Display", "H1", "H2", "H3", "Body", "Label", "Caption"];

const defaults = {
  Display: { exponent: 5, lineHeight: 1.1, weight: 800 },
  H1: { exponent: 4, lineHeight: 1.15, weight: 700 },
  H2: { exponent: 3, lineHeight: 1.2, weight: 700 },
  H3: { exponent: 2, lineHeight: 1.25, weight: 600 },
  Body: { exponent: 0, lineHeight: 1.6, weight: 400 },
  Label: { exponent: -1, lineHeight: 1.4, weight: 500 },
  Caption: { exponent: -2, lineHeight: 1.4, weight: 400 },
} as const;

export function scaleTypography(base: number, ratio: number): Typography["roles"] {
  return Object.fromEntries(typeRoles.map(role => [role, {
    size: Math.round(base * ratio ** defaults[role].exponent),
    lineHeight: defaults[role].lineHeight,
    weight: defaults[role].weight,
  }])) as Typography["roles"];
}

export function getTypography(ds: DesignSystem): Typography {
  if (ds.foundations.typography) return ds.foundations.typography;
  const roles = scaleTypography(ds.foundations.bodySize, 1.25);
  roles.H2.size = ds.foundations.headingSize;
  return { ratio: 1.25, roles };
}
