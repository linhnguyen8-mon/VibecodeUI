import type { Parameters } from './presets';
import { resolveEasing } from './easing';
export function contentSwapTokens(p: Parameters) {
  const press = 80, duration = p.duration, stagger = p.stagger ?? 60, distance = p.distance ?? 10;
  const tagStart = press, headlineStart = press + duration * .2;
  const descriptionStart = headlineStart + stagger * 5 + duration * .7;
  return { press, duration, stagger, distance, tagStart, headlineStart, descriptionStart, total: descriptionStart + duration, easing: resolveEasing(p) };
}
