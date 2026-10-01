import { expect, it } from 'vitest';
import { motionPresets } from './presets';
import { motionConfig } from './config';
import { generateMotionPrompt } from './prompt';
const preset = (id: string) => motionPresets.find(p => p.id === id)!;
it('rolls changed digits only and reverses travel without moving stable digits', () => {
  const p = preset('number-roll');
  const config = motionConfig(p, { ...p.defaultParameters, rollDirection: 'down', rollDistance: 48 });
  expect(config.contentTracks).toHaveLength(4);
  expect(config.contentTracks[0].selector).toContain('"3"');
  expect(config.contentTracks[0].frames[1].transform).toBe('translateY(48px)');
  expect(motionConfig(p, { ...p.defaultParameters, changedDigitsOnly: false }).contentTracks).toHaveLength(8);
});
it('keeps highlight one-shot unless repeat is explicitly enabled', () => {
  const p = preset('highlight-sweep');
  const c = motionConfig(p, p.defaultParameters);
  expect(c.contentTracks[0].iterations).toBe(1);
  expect(c.contentTracks[0].frames[0].backgroundSize).toBe('0% 100%');
  expect(c.contentTracks[0].frames.at(-1)?.backgroundSize).toBe('100% 100%');
  expect(motionConfig(p, { ...p.defaultParameters, repeatMode: 'loop' }).contentTracks[0].iterations).toBe(Infinity);
});
