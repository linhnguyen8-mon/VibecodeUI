import { describe, expect, it } from 'vitest';
import { motionPresets } from './presets';
import { motionConfig } from './config';
import { generateMotionPrompt } from './prompt';
import { advancedCardSchemas, dismissDecision, stackPose, fanPose, flipFrames } from './cardMotion';
const config = (id: string) => motionConfig(motionPresets.find(p => p.id === id)!, motionPresets.find(p => p.id === id)!.defaultParameters).advancedCard!;
describe('semantic advanced card presets', () => {
  it('exposes only the requested controls and synchronizes edits with prompt', () => {
    for (const id of Object.keys(advancedCardSchemas)) {
      const preset = motionPresets.find(p => p.id === id)!;
      expect(preset.parameterSchema).toEqual(advancedCardSchemas[id as keyof typeof advancedCardSchemas]);
      const key = preset.parameterSchema[0];
      const runtime = motionConfig(preset, { ...preset.defaultParameters, duration: 500, fanSpread: 45 });
      const prompt = generateMotionPrompt(preset, runtime);
      expect(prompt).toContain('500ms');
      expect(prompt).not.toContain('Exact motion frames');
      expect(prompt).not.toContain('Preview start times');
      expect(key).toBeDefined();
    }
  });
  it('computes fan geometry continuously around the active center', () => {
    const t = config('stack-fan-swipe');
    expect(fanPose(0, t)).toEqual({ x: 0, y: -12, rotation: 0, scale: 1, layer: 20 });
    expect(fanPose(1, t).rotation).toBe(9);
    expect(fanPose(-1, t).rotation).toBe(-9);
    expect(fanPose(.5, t).scale).toBeCloseTo(.96);
    expect(fanPose(2, t).y).toBe(40);
  });
  it('dismisses on threshold or recent velocity, rejecting small drags and disallowed direction', () => {
    const t = config('swipe-dismiss');
    expect(dismissDecision(100, 0, 0, 300, t)).toBe(true);
    expect(dismissDecision(20, 0, .8, 300, t)).toBe(true);
    expect(dismissDecision(20, 0, .1, 300, t)).toBe(false);
    expect(dismissDecision(2, 0, 2, 300, t)).toBe(false);
    expect(dismissDecision(-120, 0, 2, 300, { ...t, dismissDirection: 'right' })).toBe(false);
    expect(dismissDecision(0, 100, 0, 300, { ...t, dismissDirection: 'free' })).toBe(true);
  });
  it('reverses flip axis/direction without changing the stable frame', () => {
    const t = { ...config('flip-reveal'), flipAxis: 'x' as const, rotationDirection: 'counterclockwise' as const };
    expect(flipFrames(t, false)[1].transform).toBe('rotateX(-90deg) scale(0.98)');
    expect(flipFrames(t, true)[2].transform).toBe('rotateX(0deg) scale(1)');
  });
  it('keeps the front card full scale and derives the layered stack from depth', () => {
    const t = config('stack-card-cycle');
    expect(stackPose(0, t)).toEqual({ x: 0, y: 0, rotation: 0, scale: 1, layer: 10 });
    expect(stackPose(1, t).x).toBe(-6);
    expect(stackPose(1, t).scale).toBeLessThan(.9);
    expect(stackPose(4, t).scale).toBe(.85);
    expect(stackPose(4, t).rotation).toBe(6);
  });
});
