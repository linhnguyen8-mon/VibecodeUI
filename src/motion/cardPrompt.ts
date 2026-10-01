import { cardEasing } from './cardMotion';
import type { MotionPreset } from './presets';
import type { AdvancedCardConfig } from './cardMotion';
import { parameterRegistry } from './parameters';
export function advancedCardPrompt(preset: MotionPreset, t: AdvancedCardConfig): string {
  const values = preset.parameterSchema.map(key => {
    const spec = parameterRegistry[key];
    const value = preset.defaultParameters[key]; // overwritten below by resolved runtime token
    const runtime = key === 'easing' ? `${t.easing} (${cardEasing(t)})` : key === 'duration' ? t.duration : t[key as keyof AdvancedCardConfig] ?? value;
    return `- ${spec.label}: ${typeof runtime === 'number' && spec.format ? spec.format(runtime) : runtime}`;
  });
  if (!preset.parameterSchema.includes('duration')) values.push(`- Transition duration: ${t.duration}ms`);
  const instructions: Record<AdvancedCardConfig['kind'], string[]> = {
    'stack-fan-swipe': [
      'Set card height to Fan height percent of the measured fan viewport height. Keep the viewport fixed and clip the lower card tails; changing height must not resize the surrounding layout.',
      'Follow horizontal drag directly, multiplied by Swipe sensitivity. Derive each card’s fractional relative index from active index plus gesture displacement / Fan spread.',
      'Compute x = relativeIndex × Fan spread; y = Arc depth × abs(relativeIndex)² − Active lift × max(0, 1 − abs(relativeIndex)); rotation = relativeIndex × Side rotation; scale = 1 − (1 − Inactive scale) × min(1, abs(relativeIndex)).',
      `Initialize all text at opacity 0. Only after the active card settles, wait 120ms and reveal its title first, then each content row using a ${t.listReveal.distanceX}px right-to-left travel, opacity 0 → 1, ${t.listReveal.duration}ms duration and ${t.listReveal.stagger}ms stagger. Keep the outer card stationary during this list reveal, and keep inactive card content hidden. Remove the reveal delays for reduced motion.`,
      'Promote layer priority continuously as a card approaches center. At relativeIndex 0: scale 1, rotation 0, maximum lift, highest layer. Do not hard-code a transform for each card index.',
      'On release snap to the nearest relative index with a restrained, critically damped return. Snap strength controls settling responsiveness. Rebase indices after settlement without a visible jump.',
    ],
    'swipe-dismiss': [
      'Follow the pointer directly in the permitted Dismiss direction. Rotate proportionally to horizontal displacement / viewport width × Rotation intensity.',
      'Threshold is a fraction of the measured viewport width. Dismiss on release if displacement exceeds it, or a recent flick exceeds 0.65px/ms after applying Velocity sensitivity. Require at least 8px travel for a flick; reject a direction not permitted by the configuration.',
      'Do not fade early: reduce opacity only slightly near threshold, then fade to 0 at the end of the exit. Continue along the gesture direction beyond the viewport; use Exit distance as a minimum and account for actual card bounds.',
      'Remove the card only after it leaves view. Let the next card scale/move forward into its place. For short drag, cancellation or disallowed direction, settle back to translation 0, rotation 0, opacity 1 using Return spring.',
      'Offer an explicit dismiss action for keyboard users and a recovery action when dismissal changes user data.',
    ],
    'flip-reveal': [
      'Trigger on click, tap or explicit reveal; toggle back on the next activation. Put Perspective on the stable container and preserve its dimensions.',
      'Use two overlapping faces with backface-visibility hidden. Rotate the back 180° around Flip axis; rotate the shared inner element 0° → ±180° according to Rotation direction.',
      'Interpolate scale to Midpoint scale at 90°, then restore scale 1. Apply the selected Easing without strong overshoot. Never mirror text or animate frame height to fit the back.',
      'Expose only the visible face to assistive technology and keyboard focus; move focus safely when switching faces.',
    ],
    'stack-card-cycle': [
      'Arrange five overlapping cards. The front stays centered, full scale and unrotated; cards behind it alternate left/right offsets and subtle rotation, as a layered stack.',
      'Derive every pose from relative stack depth: fraction = depth / (count − 1), side alternates per depth; x = side × Fan spread × fraction; y = depth × 2px; rotation = side × Side rotation × fraction; scale = 1 for the front, otherwise 1 − (1 − Inactive scale) × (0.75 + 0.25 × fraction). Shrink all rear cards immediately so their intersecting edges stay behind the front card. Front layer always has the highest priority.',
      'Allow horizontal swipe: the front card follows the pointer, progressively scales from 1 to Inactive scale, and rotates slightly as it approaches a boundary at 35% of viewport width. Promote rear cards continuously during the drag. At the boundary commit the cycle, lower the departing card behind the stack, then return it to the back pose. On release, cycle in the gesture direction after 18% viewport travel or a recent flick above 0.65px/ms with at least 8px travel. Otherwise restore the front pose. Do not also trigger a click after dragging.',
      'On click/tap or committed swipe, move the front card aside during the first half of Duration; promote the next card toward the front pose. Lower the departing card behind the stack, then return it to the back pose during the second half. Reorder only after settlement; preserve card identity and avoid clipping content.',
      'Keep each card frame stable. Match the project’s real content and styling; the library demo uses white surfaces and skeleton title/description bars.',
    ],
  };
  return [`Apply the **"${preset.name}"** motion preset to the existing card component.`, `## Motion\n\n${values.join('\n')}`, `## State transitions\n\n${instructions[t.kind].map(rule => `- ${rule}`).join('\n')}`, '## Runtime rules\n\n- Preserve real content, styling and stable layout. Skeleton is a preview convention only.\n- Use the same semantic tokens for preview and implementation; derive geometry from real card and viewport bounds.\n- Prefer transform and opacity; keep gesture motion coupled to the pointer.\n- Interrupt and retarget from the current visible state; handle pointer cancellation, resizing and hidden views.\n- Use the existing animation stack; do not add a dependency unless required.', '## Accessibility\n\nRespect prefers-reduced-motion: remove travel, rotation, compression and delay; show the selected state immediately or with a brief fade. Keep keyboard equivalents, readable content and focus. Do not autoplay production interactions.'].join('\n\n');
}
