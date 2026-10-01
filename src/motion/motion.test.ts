import { swipePose, swipeTarget, swipeTokens } from './swipe';
import { describe, expect, it } from 'vitest';
import { motionPresets } from './presets';
import { changeIntensity, motionConfig } from './config';
import { filterPresets } from './MotionFilters';
import { generateMotionPrompt } from './prompt';
import { motionPrinciples, generateMotionPrinciples } from './principles';
import { parameterRegistry } from './parameters';
describe('motion library contract', () => {
  it('has unique presets and exposes exactly the parameters present in their defaults', () => {
    expect(motionPresets).toHaveLength(33);
    expect(new Set(motionPresets.map(p => p.id)).size).toBe(33);
    for (const preset of motionPresets) {
      expect([...preset.parameterSchema].sort()).toEqual(Object.keys(preset.defaultParameters).filter(key => key !== 'intensity' || preset.parameterSchema.includes('intensity')).filter(key => key !== 'easing' || preset.parameterSchema.includes('easing')).filter(key => key !== 'duration' || preset.parameterSchema.includes('duration')).sort());
      for (const key of preset.parameterSchema) expect(parameterRegistry[key]).toBeDefined();
      expect(preset.targets).toContain(preset.previewType);
    }
  });
  it('presses a raised button down while reducing its shadow and preserving hold timing', () => {
    const preset = motionPresets.find(p => p.id === 'button-depth-press')!;
    const config = motionConfig(preset, { ...preset.defaultParameters, depth: 6, hold: 80 });
    expect(config.frames[0].boxShadow).toBe('0 7px 0 #24475d');
    expect(config.frames[1].transform).toBe('translateY(6px)');
    expect(config.frames[1].boxShadow).toBe('0 1px 0 #24475d');
    expect(config.frames[3].transform).toBe('translateY(0px)');
    expect(config.duration).toBe(480);
    expect(generateMotionPrompt(preset, config)).toContain('Press depth: 6px');
  });
  it('animates the gradient edge separately from the solid button face', () => {
    const preset = motionPresets.find(p => p.id === 'magic-button')!;
    const config = motionConfig(preset, preset.defaultParameters);
    expect(config.contentTracks[0].duration).toBe(2400);
    expect(config.contentTracks[0].iterations).toBe(Infinity);
    expect(config.contentTracks[1].frames[1].backgroundPosition).toBe('200% 50%');
    expect(config.contentTracks[2].frames[1].transform).toBe('translateY(-2px)');
    expect(config.contentTracks[3].frames[1].transform).toBe('translateY(1px)');
    expect(config.frames.every(frame => frame.transform === 'none')).toBe(true);
    expect(generateMotionPrompt(preset, config)).toContain('infinite');
  });
  it('finishes the progress sweep before revealing completion', () => {
    const preset = motionPresets.find(p => p.id === 'progress-sweep')!;
    const config = motionConfig(preset, { ...preset.defaultParameters, duration: 600 });
    expect(config.contentTracks[0].duration).toBe(600);
    expect(config.contentTracks[0].frames[1].transform).toBe('scaleX(1)');
    expect(config.contentTracks[2].delay).toBe(600);
    expect(config.contentTracks[2].frames[0].opacity).toBe(0);
    expect(config.duration).toBe(760);
    expect(generateMotionPrompt(preset, config)).toContain('only after confirmed success');
  });
  it('moves the primary action before revealing two secondary buttons', () => {
    const preset = motionPresets.find(p => p.id === 'button-expand')!;
    const config = motionConfig(preset, { ...preset.defaultParameters, duration: 500, stagger: 100 });
    expect(config.contentTracks).toHaveLength(3);
    expect(config.contentTracks[0].frames[0].transform).toBe('translateX(0)');
    expect(config.contentTracks[1].delay).toBe(900);
    expect(config.contentTracks[2].delay).toBe(1000);
    expect(config.duration).toBe(1250);
    expect(generateMotionPrompt(preset, config)).toContain('Stagger: 100ms');
    expect(generateMotionPrompt(preset, config)).toContain('real group and button geometry');
  });
  it('expands a mobile modal from bottom-left without scaling its content', () => {
    const preset = motionPresets.find(p => p.id === 'mobile-modal-expand')!;
    const config = motionConfig(preset, preset.defaultParameters);
    expect(config.transformOrigin).toBe('0% 100%');
    expect(config.frames[0].clipPath).toBe('inset(117px 43px 9px 9px round 10px)');
    expect(config.contentTracks).toHaveLength(4);
    expect(config.contentTracks[1].delay).toBe(240);
    expect(config.contentTracks[3].delay).toBe(400);
    expect(config.duration).toBe(520);
    expect(generateMotionPrompt(preset, config)).toContain('safe-area insets');
  });
  it('replaces the Card group with two gesture presets and shares its five tokens', () => {
    const cards = filterPresets(motionPresets, 'all', 'card');
    expect(cards.map(p => p.id)).toEqual(['stack-fan-swipe', 'swipe-dismiss', 'flip-reveal', 'stack-card-cycle', 'horizontal-card-focus', 'vertical-card-compress']);
    const gestureCards = cards.slice(-2);
    for (const preset of gestureCards) {
      expect(preset.parameterSchema).toHaveLength(5);
      const config = motionConfig(preset, { ...preset.defaultParameters, cardScale: .90, duration: 500 });
      expect(config.swipe?.scale).toBe(.90);
      expect(generateMotionPrompt(preset, config)).toContain('Transition duration: 500ms');
    }
    const horizontal = swipeTokens(gestureCards[0].defaultParameters, false);
    expect(swipePose(0, 0, 200, horizontal, 0).scale).toBe(1);
    expect(swipePose(1, 0, 200, horizontal, 0).scale).toBe(.94);
    expect(swipePose(1, -200, 200, horizontal, 0).scale).toBe(1);
    const vertical = swipeTokens(gestureCards[1].defaultParameters, true);
    expect(swipePose(0, 0, 160, vertical, 0).scale).toBe(1);
    expect(swipePose(0, -80, 160, vertical, 1).scale).toBe(.92);
    expect(swipeTarget(-30, 160)).toBe(0);
    expect(swipeTarget(-50, 160)).toBe(1);
    expect(swipeTarget(50, 160)).toBe(-1);
  });
  it('defaults every motion to 400ms', () => {
    expect(motionPresets.every(p => p.defaultParameters.duration === 400)).toBe(true);
  });
  it('applies contextual principles without overriding runtime timing', () => {
    expect(motionPrinciples).toHaveLength(12);
    const content = motionPresets.find(p => p.id === 'list-reveal')!;
    const config = motionConfig(content, { ...content.defaultParameters, duration: 450 });
    expect(generateMotionPrompt(content, config)).toContain('Keep the selected 450ms duration');
    expect(generateMotionPrinciples(content, config)).toContain('reading order');
    const navigation = motionPresets.find(p => p.id === 'sidebar-expand')!;
    expect(generateMotionPrinciples(navigation, motionConfig(navigation, navigation.defaultParameters))).toContain('Keep text at its normal scale');
    expect(generateMotionPrinciples(content, config)).toContain('remove travel, scale, rotation and stagger delays');
  });
  it('combines category and target filters', () => {
    expect(filterPresets(motionPresets, 'interaction', 'button').map(p => p.id)).toEqual(['button-expand', 'progress-sweep', 'magic-button', 'button-depth-press', 'button-press']);
    expect(filterPresets(motionPresets, 'overlay', 'modal').map(p => p.id)).toEqual(['mobile-modal-expand', 'show-modal']);
    expect(filterPresets(motionPresets, 'loading', 'button')).toEqual([]);
  });
  it('uses the same duration, scale, fade and easing in frames and prompt after manual changes', () => {
    const preset = motionPresets.find(p => p.id === 'show-modal')!;
    const parameters = { ...preset.defaultParameters, duration: 450, scale: .92, opacity: false, easing: 'snappy' as const };
    const config = motionConfig(preset, parameters);
    const prompt = generateMotionPrompt(preset, config);
    expect(config.frames[0]).toEqual({ transform: 'scale(0.92)', opacity: 1 });
    expect(prompt).toContain('Duration: 450ms');
    expect(prompt).toContain('Scale: 0.92 → 1');
    expect(prompt).toContain(`Easing: ${config.easing}`);
    expect(prompt).not.toContain(JSON.stringify(config.frames));
    expect(prompt).not.toContain('Exact motion frames');
    expect(prompt).toContain('existing modal component');
    expect(prompt).toContain('prefers-reduced-motion');
  });
  it('changes intensity from defaults without compounding, with manual values winning afterward', () => {
    const preset = motionPresets.find(p => p.id === 'button-press')!;
    const expressive = changeIntensity(preset, preset.defaultParameters, 'expressive');
    expect(expressive.scale).toBeCloseTo(.92);
    const manual = { ...expressive, scale: .95 };
    expect(motionConfig(preset, manual).frames[1].transform).toBe('scale(0.95)');
    const normal = changeIntensity(preset, manual, 'normal');
    expect(normal.scale).toBe(.96);
    expect(normal.duration).toBe(400);
    expect(preset.defaultParameters.scale).toBe(.96);
  });
  it('keeps intensity values aligned with the control steps', () => {
    for (const preset of motionPresets) {
      for (const intensity of ['subtle', 'normal', 'expressive'] as const) {
        const values = changeIntensity(preset, preset.defaultParameters, intensity);
        expect(values.duration % 10).toBe(0);
        expect(values.duration).toBeGreaterThanOrEqual(80);
        expect(values.duration).toBeLessThanOrEqual(800);
        if (values.distance !== undefined) expect(Number.isInteger(values.distance)).toBe(true);
        if (values.scale !== undefined) expect(values.scale).toBe(Number(values.scale.toFixed(2)));
      }
    }
  });
  it('uses smooth exits, bounded spatial settling and exact hold timing', () => {
    const exit = motionPresets.find(p => p.id === 'slide-out')!;
    const enter = motionPresets.find(p => p.id === 'fade-in')!;
    expect(exit.defaultParameters.duration).toBe(enter.defaultParameters.duration);
    expect(motionConfig(exit, exit.defaultParameters).easing).toBe('cubic-bezier(0.42, 0, 0.58, 1)');
    const success = motionPresets.find(p => p.id === 'success-pop')!;
    const spring = motionConfig(success, success.defaultParameters);
    expect(spring.frames).toHaveLength(121);
    expect(spring.frames.every(frame => frame.opacity === undefined || Number(frame.opacity) <= 1)).toBe(true);
    expect(generateMotionPrompt(success, spring)).toContain('Bounce: 15%');
    const press = motionPresets.find(p => p.id === 'button-press')!;
    const held = motionConfig(press, { ...press.defaultParameters, hold: 100 });
    expect(held.duration).toBe(500);
    expect(Number(held.frames[1].offset) * held.duration).toBe(80);
    expect((Number(held.frames[2].offset) - Number(held.frames[1].offset)) * held.duration).toBeCloseTo(100);
    expect(held.easing).toBe('linear');
    expect(held.frames[1].easing).not.toBe('linear');
    expect(generateMotionPrompt(press, held)).toContain('Total playback duration: 500ms');
  });
  it('uses a monotonic no-bounce spring by default with a perceptual-duration tail', () => {
    const preset = motionPresets.find(p => p.id === 'toggle-switch')!;
    expect(preset.defaultParameters.bounce).toBe(0);
    expect(preset.parameterSchema).not.toContain('damping');
    const config = motionConfig(preset, preset.defaultParameters);
    const positions = config.frames.map(frame => Number(String(frame.transform).match(/translateX\(([-\d.]+)px\)/)?.[1]));
    expect(positions[0]).toBe(0);
    expect(positions[positions.length - 1]).toBe(24);
    expect(positions.every((value, index) => index === 0 || value >= positions[index - 1])).toBe(true);
    expect(config.duration).toBeGreaterThan(preset.defaultParameters.duration);
    expect(generateMotionPrompt(preset, config)).toContain(`Settling duration: ${config.duration}ms`);
  });
  it('reveals the list title before each item and exports the same stagger', () => {
    const preset = motionPresets.find(p => p.id === 'list-reveal')!;
    const config = motionConfig(preset, { ...preset.defaultParameters, stagger: 100 });
    expect(config.sequence).toEqual([0, 100, 200, 300]);
    expect(generateMotionPrompt(preset, config)).toContain('Stagger: 100ms');
    expect(generateMotionPrompt(preset, config)).toContain('title first');
  });
  it('animates content elements in sequence instead of the outer container', () => {
    for (const preset of motionPresets.filter(p => p.previewType === 'content' && !['content-swap', 'number-roll', 'text-swap', 'highlight-sweep'].includes(p.behavior))) {
      expect(motionConfig(preset, preset.defaultParameters).sequence).toEqual([0, 80, 160, 240]);
      expect(generateMotionPrompt(preset, motionConfig(preset, preset.defaultParameters))).toContain('keeping the outer container stationary');
    }
  });
  it('combines horizontal and vertical list travel with the same stagger config', () => {
    const preset = motionPresets.find(p => p.id === 'list-reveal')!;
    const parameters = { ...preset.defaultParameters, distanceX: -20, distance: 16, stagger: 120 };
    const config = motionConfig(preset, parameters);
    expect(config.frames[0].transform).toBe('translate(20px, 16px)');
    expect(config.frames[config.frames.length - 1].transform).toBe('translate(0px, 0px)');
    expect(config.sequence).toEqual([0, 120, 240, 360]);
    const prompt = generateMotionPrompt(preset, config);
    expect(prompt).toContain('Move X: -20px');
    expect(prompt).toContain('Move Y: 16px');
    expect(prompt).toContain('Stagger: 120ms');
  });
  it('keeps desktop and mobile modal presets with a shared origin for preview and prompt', () => {
    const matches = filterPresets(motionPresets, 'all', 'modal');
    expect(matches.map(p => p.id)).toEqual(['mobile-modal-expand', 'show-modal']);
    const preset = matches.find(p => p.id === 'show-modal')!;
    const config = motionConfig(preset, { ...preset.defaultParameters, origin: 'bottom-left' });
    expect(config.transformOrigin).toBe('0% 100%');
    expect(config.frames[0].transform).toBe('translate(-32px, 32px) scale(0.96)');
    expect(config.frames[config.frames.length - 1].transform).toBe('translate(0px, 0px) scale(1)');
    expect(generateMotionPrompt(preset, config)).toContain('Origin: bottom-left');
  });
  it('offers exactly three navigation demos with distinct sidebar end states', () => {
    const navigation = filterPresets(motionPresets, 'all', 'navigation');
    expect(navigation.map(p => p.id)).toEqual(['sidebar-slide', 'sidebar-expand', 'sidebar-collapse']);
    const expand = navigation[1];
    const expanded = motionConfig(expand, expand.defaultParameters);
    expect(expanded.frames[0].transform).toBe('translateX(-22px)');
    expect(expanded.frames[0].clipPath).toBe('inset(0 112px 0 0 round 8px)');
    expect(expanded.contentTracks).toHaveLength(5);
    expect(expanded.frames.every(frame => !String(frame.transform).includes('scale'))).toBe(true);
    expect(expanded.frames[expanded.frames.length - 1].transform).toBe('translateX(0px)');
    const collapse = motionConfig(navigation[2], navigation[2].defaultParameters);
    expect(collapse.frames[collapse.frames.length - 1].clipPath).toBe('inset(0 46px 0 0 round 6px)');
    expect(generateMotionPrompt(expand, expanded)).toContain('actual sidebar/modal bounding boxes');
  });
  it('reverses exit frames and gives distinct loading motion', () => {
    const spinner = motionPresets.find(p => p.id === 'spinner')!;
    expect(motionConfig(spinner, spinner.defaultParameters).frames[1].transform).toBe('rotate(360deg)');
  });
});
