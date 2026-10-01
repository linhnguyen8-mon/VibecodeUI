import type { Parameters } from './presets';
export function swipeTokens(parameters: Parameters, vertical: boolean) {
  return { vertical, direction: parameters.direction ?? 'forward', scale: parameters.cardScale ?? (vertical ? .92 : .94), peek: parameters.peek ?? 18, strength: parameters.snapStrength ?? 1, duration: parameters.duration };
}
export type SwipeTokens = ReturnType<typeof swipeTokens>;
export function swipePose(relative: number, offset: number, stride: number, tokens: SwipeTokens, compression: number) {
  const position = relative * stride + offset;
  const proximity = Math.min(1, Math.abs(position) / stride);
  return { position, scale: tokens.vertical ? 1 - (1 - tokens.scale) * compression : 1 - (1 - tokens.scale) * proximity, opacity: tokens.vertical ? 1 : 1 - .08 * proximity, zIndex: 10 - Math.round(proximity * 5) };
}
export function swipeTarget(offset: number, stride: number) { return Math.abs(offset) >= stride * .25 ? offset < 0 ? 1 : -1 : 0; }
