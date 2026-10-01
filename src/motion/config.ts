import { advancedCardConfig } from './cardMotion';
import { swipeTokens } from './swipe';
import type { MotionPreset, Parameters } from './presets';
import { easingMap, resolveEasing } from './easing';
export { easingMap } from './easing';
export function changeIntensity(preset: MotionPreset, current: Parameters, intensity: Parameters['intensity']): Parameters {
  const factor = { subtle: .5, normal: 1, expressive: 2 }[intensity];
  const base = preset.defaultParameters;
  return { ...current, intensity, duration: Math.max(80, Math.min(800, Math.round(base.duration * (intensity === 'subtle' ? .85 : intensity === 'expressive' ? 1.15 : 1) / 10) * 10)), ...(base.depth !== undefined ? { depth: Math.max(1, Math.min(8, Math.round(base.depth * factor))) } : {}), ...(base.distanceX !== undefined ? { distanceX: Math.max(-48, Math.min(48, Math.round(base.distanceX * factor))) } : {}), ...(base.bounce !== undefined ? { bounce: Math.min(30, Math.round(base.bounce * factor)) } : {}), ...(base.distance !== undefined ? { distance: Math.min(48, Math.round(base.distance * factor)) } : {}), ...(base.scale !== undefined ? { scale: Math.max(.9, Math.round((1 - (1 - base.scale) * factor) * 100) / 100) } : {}) };
}
export function motionConfig(preset: MotionPreset, parameters: Parameters) {
  const { distance = 0, distanceX = 0, scale = 1, opacity = false } = parameters;
  const origin = parameters.origin ?? 'center';
  const originX = origin.includes('left') ? -1 : origin.includes('right') ? 1 : 0;
  const originY = origin.includes('top') ? -1 : origin.includes('bottom') ? 1 : 0;
  const transformOrigin = `${originX < 0 ? '0%' : originX > 0 ? '100%' : '50%'} ${originY < 0 ? '0%' : originY > 0 ? '100%' : '50%'}`;
  const modalTransform = (progress: number) => `${originX || originY ? `translate(${originX * distance * (1 - progress)}px, ${originY * distance * (1 - progress)}px) ` : ''}scale(${scale + (1 - scale) * progress})`;
  const navigationFrame = (progress: number): Keyframe => {
    if (preset.behavior === 'sidebar-expand') return {
      transform: `translateX(${-22 * (1 - progress)}px)`,
      clipPath: `inset(0 ${112 * (1 - progress)}px 0 0 round ${8 + progress * 4}px)`,
      borderRadius: `${8 + progress * 4}px`, opacity: 1,
    };
    if (preset.behavior === 'sidebar-collapse') return { clipPath: `inset(0 ${46 * progress}px 0 0 round 6px)`, opacity: 1 };
    return { transform: `translateX(${-(68 + distance) * (1 - progress)}px)`, opacity: 1 };
  };
  const neutral = { transform: 'none', opacity: 1 };
  let frames: Keyframe[];
  const from = { transform: preset.behavior === 'vertical' ? preset.previewType === 'list' ? `translate(${-distanceX}px, ${distance}px)` : `translateY(${distance}px)` : preset.behavior === 'horizontal' ? `translateX(${-distance}px)` : preset.behavior === 'scale' ? preset.id === 'show-modal' ? modalTransform(0) : `scale(${scale})` : 'none', opacity: opacity ? 0 : 1 };
  switch (preset.behavior) {
    case 'sidebar-expand': case 'sidebar-collapse': frames = [navigationFrame(0), navigationFrame(1)]; break;
    case 'mobile-modal-expand': {
      const left = originX < 0 ? 9 : originX > 0 ? 43 : 26;
      const top = originY < 0 ? 9 : originY > 0 ? 117 : 63;
      frames = [{ clipPath: `inset(${top}px ${52 - left}px ${126 - top}px ${left}px round 10px)` }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }];
      break;
    }
    case 'button-expand': frames = [neutral, neutral]; break;
    case 'progress-bar-sweep': frames = [neutral, neutral]; break;
    case 'progress-sweep': frames = [neutral, neutral]; break;
    case 'depth-press': {
      const depth = parameters.depth ?? 4;
      const raised = { transform: 'translateY(0px)', boxShadow: `0 ${depth + 1}px 0 #24475d` };
      frames = [raised, { transform: `translateY(${depth}px)`, boxShadow: '0 1px 0 #24475d', offset: .3 }, raised];
      break;
    }
    case 'press': frames = [neutral, { transform: `scale(${scale})`, offset: .45 }, neutral]; break;
    case 'lift': frames = [neutral, { transform: `translateY(${-distance}px)`, offset: .5 }, neutral]; break;
    case 'toggle': frames = [{ transform: 'translateX(0)' }, { transform: `translateX(${distance}px)` }]; break;
    case 'pulse': frames = [neutral, { transform: `scale(${scale})`, offset: .5 }, neutral]; break;
    case 'shake': frames = [0, -1, 1, -.6, .6, 0].map(n => ({ transform: `translateX(${n * distance}px)` })); break;
    case 'spin': frames = [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }]; break;
    case 'shimmer': frames = [{ transform: 'translateX(-140%)', opacity: 0 }, { opacity: .8, offset: .5 }, { transform: 'translateX(140%)', opacity: 0 }]; break;
    default: frames = preset.previewType === 'navigation' ? [navigationFrame(0), navigationFrame(1)] : preset.category === 'exit' ? [neutral, from] : [from, neutral];
  }
  const bounce = (parameters.bounce ?? 0) / 100;
  let duration = parameters.duration;
  if (parameters.hold !== undefined && ['press', 'depth-press', 'lift', 'pulse'].includes(preset.behavior)) {
    duration += parameters.hold;
    const arrive = preset.behavior === 'press' ? Math.min(80, parameters.duration * .2) : preset.behavior === 'depth-press' ? parameters.duration * .3 : parameters.duration * .5;
    const peak = frames[1];
    frames = [frames[0], { ...peak, offset: arrive / duration }, { ...peak, offset: (arrive + parameters.hold) / duration }, frames[frames.length - 1]];
  }
  let easing = parameters.easing === 'linear' ? 'linear'
    : parameters.easing === 'spring' ? easingMap.smooth
    : preset.category === 'exit' && parameters.easing === 'smooth' ? 'cubic-bezier(0.42, 0, 0.58, 1)'
    : preset.behavior === 'pulse' && parameters.easing === 'smooth' ? 'ease-in-out'
    : resolveEasing(parameters);
  if (parameters.hold !== undefined) {
    frames = frames.map((frame, index) => index === frames.length - 1 ? frame : { ...frame, easing });
    easing = 'linear'; // Segment easing preserves actual hold and settling timestamps.
  }
  if (preset.category !== 'exit' && parameters.easing === 'spring' && ['scale', 'vertical', 'horizontal', 'toggle', 'sidebar-expand', 'sidebar-collapse'].includes(preset.behavior)) {
    // A damped oscillator from rest: zero initial velocity and a soft settling tail.
    // Duration is perceptual pacing; playback includes the tail, as in Apple's model.
    const dampingRatio = 1 - bounce;
    const endTime = 12 / dampingRatio;
    duration = Math.round(parameters.duration * endTime / (2 * Math.PI));
    frames = Array.from({ length: 121 }, (_, index) => {
      const offset = index / 120;
      const time = offset * endTime;
      const w = Math.sqrt(Math.max(0, 1 - dampingRatio * dampingRatio));
      const progress = index === 120 ? 1 : w < .0001
        ? 1 - Math.exp(-time) * (1 + time)
        : 1 - Math.exp(-dampingRatio * time) * (Math.cos(w * time) + dampingRatio / w * Math.sin(w * time));
      if (preset.previewType === 'navigation') return { ...navigationFrame(progress), offset };
      const remaining = 1 - progress;
      return { offset,
        transform: preset.behavior === 'scale' ? preset.id === 'show-modal' ? modalTransform(progress) : `scale(${scale + (1 - scale) * progress})`
          : preset.behavior === 'vertical' ? preset.previewType === 'list' ? `translate(${-distanceX * remaining}px, ${distance * remaining}px)` : `translateY(${distance * remaining}px)`
          : preset.behavior === 'horizontal' ? `translateX(${-distance * remaining}px)`
          : `translateX(${distance * progress}px)`,
        opacity: opacity ? Math.min(1, Math.max(0, progress)) : 1,
      };
    });
    easing = 'linear'; // Samples already contain the spring timing.
  }
  const sequence = preset.behavior !== 'content-swap' && (preset.previewType === 'list' || preset.previewType === 'content') && parameters.stagger !== undefined ? [0, 1, 2, 3].map(index => index * parameters.stagger!) : undefined;
  const contentTracks: { selector: string; frames: Keyframe[]; delay: number; duration: number; iterations?: number; easing?: string }[] = preset.behavior === 'sidebar-expand' ? [
    { selector: '[data-sidebar-content]', frames: [{ opacity: 1 }, { opacity: 0 }], delay: 0, duration: 140 },
    { selector: '[data-modal-title]', frames: [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], delay: Math.round(parameters.duration * .4), duration: 180 },
    ...[0, 1, 2].map(index => ({ selector: `[data-modal-field="${index}"]`, frames: [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], delay: Math.round(parameters.duration * .5) + index * 60, duration: 200 })),
  ] : [];
  if (preset.behavior === 'mobile-modal-expand') {
    const left = originX < 0 ? 9 : originX > 0 ? 43 : 26;
    const top = originY < 0 ? 9 : originY > 0 ? 117 : 63;
    contentTracks.push(
      { selector: '[data-mobile-header]', frames: [{ transform: `translate(${left}px, ${top}px)` }, { transform: 'translate(0px, 0px)' }], delay: 0, duration: parameters.duration, easing },
      ...[0, 1, 2].map(index => ({ selector: `[data-mobile-field="${index}"]`, frames: [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0px)' }], delay: Math.round(parameters.duration * .6) + index * (parameters.stagger ?? 80), duration: Math.round(parameters.duration * .3), easing })),
    );
    duration = Math.max(parameters.duration, Math.round(parameters.duration * .9) + 2 * (parameters.stagger ?? 80));
    frames = [frames[0], { ...frames[1], offset: parameters.duration / duration }, frames[1]];
  }
  if (preset.behavior === 'button-expand') {
    const stagger = parameters.stagger ?? 80;
    const curve = resolveEasing(parameters);
    contentTracks.push(
      { selector: '[data-expand-primary]', frames: [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(-100% - 12px))' }], delay: 650, duration: parameters.duration, easing: curve },
      ...[0, 1].map(index => ({ selector: `[data-expand-secondary="${index}"]`, frames: [{ opacity: 0, transform: 'translateX(-8px) scale(0.96)' }, { opacity: 1, transform: 'translateX(0) scale(1)' }], delay: 650 + Math.round(parameters.duration * .5) + index * stagger, duration: Math.round(parameters.duration * .5), easing: curve })),
    );
    duration = 650 + parameters.duration + stagger;
  }
  if (preset.behavior === 'progress-bar-sweep') contentTracks.push({ selector: '[data-progress-bar-fill]', frames: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], delay: 0, duration: parameters.duration, easing: 'linear' });
  if (preset.behavior === 'progress-sweep') {
    contentTracks.push(
      { selector: '[data-button-progress]', frames: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], delay: 0, duration: parameters.duration, easing: 'linear' },
      { selector: '[data-button-label]', frames: [{ opacity: 1 }, { opacity: 0 }], delay: parameters.duration, duration: 100 },
      { selector: '[data-button-check]', frames: [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'scale(1)' }], delay: parameters.duration, duration: 160 },
    );
    duration = parameters.duration + 160;
  }
  if (preset.id === 'magic-button') {
    const depth = parameters.depth ?? 4;
    const arrive = parameters.duration * .3;
    const total = parameters.duration + (parameters.hold ?? 0);
    const offsets = [0, arrive / total, (arrive + (parameters.hold ?? 0)) / total, 1];
    const curve = 'cubic-bezier(0.3, 0.7, 0.4, 1)';
    frames = [{ transform: 'none' }, { transform: 'none' }];
    contentTracks.push(
      ...['[data-magic-shadow]', '[data-magic-edge]'].map(selector => ({ selector, frames: [{ backgroundPosition: '0% 50%' }, { backgroundPosition: '200% 50%' }], delay: 0, duration: parameters.duration * 6, iterations: Infinity })),
      { selector: '[data-magic-front]', frames: [-depth, -Math.min(2, depth / 2), -Math.min(2, depth / 2), -depth].map((y, index) => ({ transform: `translateY(${y}px)`, offset: offsets[index], easing: index === 0 ? 'linear' : curve })), delay: 0, duration: total, easing: 'linear' },
      { selector: '[data-magic-shadow]', frames: [2, 1, 1, 2].map((y, index) => ({ transform: `translateY(${y}px)`, offset: offsets[index], easing: index === 0 ? 'linear' : curve })), delay: 0, duration: total, easing: 'linear' },
    );
  }
  if (preset.behavior === 'number-roll') {
    const direction = parameters.rollDirection === 'down' ? 1 : -1, travel = parameters.rollDistance ?? 36;
    const digits = parameters.changedDigitsOnly ? [3, 1] : [3, 2, 1, 0];
    digits.forEach((digit, order) => {
      const delay = order * (parameters.digitStagger ?? 25);
      contentTracks.push({ selector: `[data-digit="${digit}"] [data-digit-old]`, frames: [{ transform: 'translateY(0px)' }, { transform: `translateY(${direction * travel}px)` }], delay, duration: parameters.duration, easing },
        { selector: `[data-digit="${digit}"] [data-digit-new]`, frames: [{ transform: `translateY(${-direction * travel}px)` }, { transform: 'translateY(0px)' }], delay, duration: parameters.duration, easing });
    });
    duration = parameters.duration + (digits.length - 1) * (parameters.digitStagger ?? 25); frames = [neutral, neutral];
  }
  if (preset.behavior === 'text-swap') {
    const d = parameters.swapDistance ?? 20, dir = parameters.swapDirection ?? 'left';
    const axis = ['left', 'right'].includes(dir) ? 'X' : 'Y', sign = ['left', 'up'].includes(dir) ? -1 : 1;
    const delay = parameters.duration * (1 - (parameters.overlap ?? .8));
    contentTracks.push({ selector: '[data-text-old]', frames: [{ opacity: 1, transform: `translate${axis}(0px)` }, { opacity: parameters.exitOpacity ?? 0, transform: `translate${axis}(${sign * d}px)` }], delay: 0, duration: parameters.duration, easing },
      { selector: '[data-text-new]', frames: [{ opacity: 0, transform: `translate${axis}(${-sign * d}px)` }, { opacity: 1, transform: `translate${axis}(0px)` }], delay, duration: parameters.duration, easing });
    duration = parameters.duration + delay; frames = [neutral, neutral];
  }
  if (preset.behavior === 'highlight-sweep') {

    contentTracks.push({ selector: '[data-highlight]', frames: [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], delay: parameters.delay ?? 0, duration: parameters.duration, easing: 'linear', iterations: parameters.repeatMode === 'loop' ? Infinity : 1 });
    duration = parameters.duration + (parameters.delay ?? 0); frames = [neutral, neutral];
  }
  return { advancedCard: advancedCardConfig(preset, parameters), swipe: ['horizontal-card-focus', 'vertical-card-compress'].includes(preset.behavior) ? swipeTokens(parameters, preset.behavior === 'vertical-card-compress') : undefined, parameters, frames, duration, easing, sequence, transformOrigin, contentTracks, previewLeadIn: ['sidebar-expand', 'mobile-modal-expand'].includes(preset.behavior) ? 650 : 0, repeatDelay: preset.behavior === 'highlight-sweep' ? 0 : parameters.repeatDelay ?? 1400 };

}
export type MotionConfig = ReturnType<typeof motionConfig>;
