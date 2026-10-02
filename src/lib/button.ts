import { resolveTokenGraph } from "./tokenGraph";
import type { ButtonSize, ButtonSizeConfig, DesignSystem } from "../types";
import { spacingValue } from "./spacing";

export const buttonSizeOrder: ButtonSize[] = ["S", "M", "L"];

export const defaultButtonSizes: Record<ButtonSize, ButtonSizeConfig> = {
  S: { height: 32, fontSize: 12, fontWeight: 600, paddingX: 20, paddingY: 8, iconPaddingLeft: 16, iconPaddingRight: 12, iconGap: 16, iconSize: 28, paddingXToken: "XL", paddingYToken: "S", iconPaddingLeftToken: "L", iconPaddingRightToken: "M", iconGapToken: "L" },
  M: { height: 40, fontSize: 12, fontWeight: 500, paddingX: 12, paddingY: 8, iconPaddingLeft: 16, iconPaddingRight: 12, iconGap: 8, iconSize: 16, paddingXToken: "M", paddingYToken: "S", iconPaddingLeftToken: "L", iconPaddingRightToken: "M", iconGapToken: "S" },
  L: { height: 48, fontSize: 14, fontWeight: 600, paddingX: 20, paddingY: 12, iconPaddingLeft: 20, iconPaddingRight: 16, iconGap: 8, iconSize: 20, paddingXToken: "XL", paddingYToken: "M", iconPaddingLeftToken: "XL", iconPaddingRightToken: "L", iconGapToken: "S" },
};

export function getButtonSize(ds: DesignSystem, size: ButtonSize): ButtonSizeConfig {
  const button = { ...defaultButtonSizes[size], ...ds.foundations.buttonSizes?.[size] };
  const values = ds.tokenModelVersion === 1 ? resolveTokenGraph(ds.tokens) : new Map<string,string>();
  return {
    ...button,
    ...(size === 'M' && !ds.tokenModelVersion && ds.tokens.some(t => t.name === 'control.height.md') ? Object.fromEntries([['height','control.height.md'],['fontSize','typography.button.font-size'],['fontWeight','typography.button.font-weight']].filter(([,name]) => ds.tokens.some(t => t.name === name)).map(([key,name]) => [key,parseFloat(ds.tokens.find(t => t.name === name)!.value)])) : {}),
    paddingX: spacingValue(ds, button.paddingXToken!),
    paddingY: spacingValue(ds, button.paddingYToken!),
    iconPaddingLeft: spacingValue(ds, button.iconPaddingLeftToken!),
    iconPaddingRight: spacingValue(ds, button.iconPaddingRightToken!),
    iconGap: spacingValue(ds, button.iconGapToken!),
    ...(size === 'M' && !ds.tokenModelVersion ? Object.fromEntries([['paddingX','spacing.button.padding-x'],['paddingY','spacing.button.padding-y']].filter(([,name]) => ds.tokens.some(t => t.name === name)).map(([key,name]) => [key,parseFloat(ds.tokens.find(t => t.name === name)!.value)])) : {}),
    ...Object.fromEntries(["paddingX","paddingY","iconPaddingLeft","iconPaddingRight","iconGap"].filter(key => values.has(`foundation.buttonSizes.${size}.${key}`)).map(key => [key,parseFloat(values.get(`foundation.buttonSizes.${size}.${key}`)!)])),
  };
}
