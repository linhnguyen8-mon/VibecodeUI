import { expect, it } from 'vitest';
import { easingMap, resolveEasing } from './easing';
import { motionPresets } from './presets';
import { motionConfig } from './config';
import { generateMotionPrompt } from './prompt';
it('supports hold, directional back curves and editable bezier in preview and prompt', () => {
  expect(easingMap.hold).toBe('steps(1, end)');
  expect(easingMap['ease-in-back']).toContain('-0.56');
  expect(easingMap['ease-out-back']).toContain('1.56');
  const p = motionPresets.find(p => p.id === 'fade-up')!;
  const params = { ...p.defaultParameters, easing: 'custom-bezier' as const, bezierX1: .3, bezierY1: -.2, bezierX2: .8, bezierY2: 1.4 };
  const curve = 'cubic-bezier(0.3, -0.2, 0.8, 1.4)';
  expect(resolveEasing(params)).toBe(curve);
  expect(motionConfig(p, params).easing).toBe(curve);
  expect(generateMotionPrompt(p, motionConfig(p, params))).toContain(curve);
});
