import { resolveTokenGraph } from "./tokenGraph";
import type { BadgeConfig, DesignSystem } from "../types";
import { spacingValue } from "./spacing";

export const defaultBadge: BadgeConfig = {
  height: 24,
  fontSize: 10,
  paddingX: 9,
  radius: 5,
  paddingXToken: "S",
};

export function getBadge(ds: DesignSystem): BadgeConfig {
  const badge = { ...defaultBadge, ...ds.foundations.badge };
  return { ...badge, paddingX: ds.tokenModelVersion === 1 ? parseFloat(resolveTokenGraph(ds.tokens).get("foundation.badge.paddingX")!) : spacingValue(ds, badge.paddingXToken!) };
}
