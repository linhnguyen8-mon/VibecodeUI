import { resolveEasing } from './easing';
import type { MotionPreset, Parameters } from './presets';

export const advancedCardSchemas = {
  'stack-fan-swipe': ['fanSpread', 'fanHeight', 'arcDepth', 'sideRotation', 'inactiveScale', 'activeLift', 'swipeSensitivity', 'snapStrength'],
  'swipe-dismiss': ['dismissDirection', 'threshold', 'rotationIntensity', 'exitDistance', 'velocitySensitivity', 'returnSpring'],
  'flip-reveal': ['flipAxis', 'duration', 'perspective', 'rotationDirection', 'midpointScale', 'easing'],
  'stack-card-cycle': ['fanSpread', 'sideRotation', 'inactiveScale', 'duration', 'easing'],
} as const;
export type AdvancedCardKind = keyof typeof advancedCardSchemas;
export function advancedCardConfig(preset: MotionPreset, p: Parameters) {
  if (!(preset.id in advancedCardSchemas)) return undefined;
  return { listReveal: { duration: p.duration, stagger: 80, distanceX: 12 }, kind: preset.id as AdvancedCardKind, duration: p.duration, easing: p.easing, bezierX1: p.bezierX1, bezierY1: p.bezierY1, bezierX2: p.bezierX2, bezierY2: p.bezierY2,
    fanSpread: p.fanSpread ?? 36, fanHeight: p.fanHeight ?? 132, arcDepth: p.arcDepth ?? 10, sideRotation: p.sideRotation ?? 9, inactiveScale: p.inactiveScale ?? .92, activeLift: p.activeLift ?? 12, swipeSensitivity: p.swipeSensitivity ?? 1, snapStrength: p.snapStrength ?? 1,
    dismissDirection: p.dismissDirection ?? 'horizontal', threshold: p.threshold ?? .3, rotationIntensity: p.rotationIntensity ?? 12, exitDistance: p.exitDistance ?? 240, velocitySensitivity: p.velocitySensitivity ?? 1, returnSpring: p.returnSpring ?? 1,
    flipAxis: p.flipAxis ?? 'y', perspective: p.perspective ?? 800, rotationDirection: p.rotationDirection ?? 'clockwise', midpointScale: p.midpointScale ?? .98,
    enterDirection: p.enterDirection ?? 'bottom', distance: p.distance ?? 20, startOpacity: p.startOpacity ?? 0, startScale: p.startScale ?? .96, delay: p.delay ?? 0, triggerMode: p.triggerMode ?? 'repeat' };
}
export type AdvancedCardConfig = NonNullable<ReturnType<typeof advancedCardConfig>>;
export function fanPose(relative: number, t: AdvancedCardConfig) {
  const depth = Math.abs(relative);
  return { x: relative * t.fanSpread, y: t.arcDepth * depth * depth - t.activeLift * Math.max(0, 1 - depth), rotation: relative * t.sideRotation, scale: 1 - (1 - t.inactiveScale) * Math.min(1, depth), layer: 20 - Math.round(depth * 5) };
}
export function dismissDecision(x: number, y: number, velocity: number, width: number, t: AdvancedCardConfig) {
  const directional = t.dismissDirection === 'left' ? x < 0 : t.dismissDirection === 'right' ? x > 0 : true;
  const displacement = t.dismissDirection === 'free' ? Math.hypot(x, y) : Math.abs(x);
  return directional && (displacement >= width * t.threshold || (displacement >= 8 && velocity * t.velocitySensitivity >= .65));
}
export function flipFrames(t: AdvancedCardConfig, fromBack: boolean): Keyframe[] {
  const sign = t.rotationDirection === 'clockwise' ? 1 : -1;
  const rotation = t.flipAxis === 'x' ? 'rotateX' : 'rotateY';
  return [0, .5, 1].map(progress => ({ offset: progress, transform: `${rotation}(${sign * 180 * (fromBack ? 1 - progress : progress)}deg) scale(${progress === .5 ? t.midpointScale : 1})` }));
}
export function enterFrames(t: AdvancedCardConfig): Keyframe[] {
  const x = t.enterDirection === 'left' ? -t.distance : t.enterDirection === 'right' ? t.distance : 0;
  const y = t.enterDirection === 'top' ? -t.distance : t.enterDirection === 'bottom' ? t.distance : 0;
  return [{ opacity: t.startOpacity, transform: `translate(${x}px, ${y}px) scale(${t.startScale})` }, { opacity: 1, transform: 'translate(0px, 0px) scale(1)' }];
}
export function cardEasing(t: AdvancedCardConfig) { return t.easing === 'spring' ? 'cubic-bezier(0.22, 1, 0.36, 1)' : resolveEasing(t); }

export function stackPose(depth: number, t: AdvancedCardConfig) {
  const relative = depth / 4;
  const side = depth % 2 ? -1 : 1;
  return { x: depth === 0 ? 0 : side * t.fanSpread * relative, y: depth * 2, rotation: depth === 0 ? 0 : side * t.sideRotation * relative, scale: depth === 0 ? 1 : 1 - (1 - t.inactiveScale) * (.75 + .25 * relative), layer: 10 - depth };
}
export function stackTransform(depth: number, t: AdvancedCardConfig) {
  const pose = stackPose(depth, t);
  return `translate(calc(-50% + ${pose.x}px), calc(-50% + ${pose.y}px)) rotate(${pose.rotation}deg) scale(${pose.scale})`;
}
