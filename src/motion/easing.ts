import type { Parameters } from './presets';
// Cubic equivalents; Figma's public API documents names but not every preset coordinate.
export const easingMap = {
  hold: 'steps(1, end)', linear: 'linear',
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  'ease-in-and-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
  'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-and-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'custom-bezier': 'cubic-bezier(0.42, 0, 0.58, 1)',
  smooth: 'cubic-bezier(0.22, 1, 0.36, 1)', snappy: 'cubic-bezier(0.2, 0, 0, 1)', spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
export function resolveEasing(p: Pick<Parameters, 'easing' | 'bezierX1' | 'bezierY1' | 'bezierX2' | 'bezierY2'>) {
  return p.easing === 'custom-bezier' ? `cubic-bezier(${p.bezierX1 ?? .42}, ${p.bezierY1 ?? 0}, ${p.bezierX2 ?? .58}, ${p.bezierY2 ?? 1})` : easingMap[p.easing];
}
