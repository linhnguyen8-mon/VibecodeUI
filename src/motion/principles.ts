import type { MotionPreset } from './presets';
import type { MotionConfig } from './config';

export const motionPrinciplesSource = 'https://godui.design/docs/guidelines/principles';
// Adapted for this library; runtime parameters remain the source of motion values.
export const motionPrinciples = [
  { id: 'clarity', name: 'Clarity', rule: 'Explain one state change at a time.' },
  { id: 'continuity', name: 'Continuity', rule: 'Keep the moving object recognizable throughout its transition.' },
  { id: 'hierarchy', name: 'Hierarchy', rule: 'Reveal primary information before supporting details.' },
  { id: 'space', name: 'Spatial awareness', rule: 'Use an origin that matches the element’s placement.' },
  { id: 'feedback', name: 'Feedback', rule: 'Acknowledge input immediately; confirm success only after completion.' },
  { id: 'timing', name: 'Timing & easing', rule: 'Use the configured curve and duration consistently.' },
  { id: 'anticipation', name: 'Anticipation', rule: 'Add preparation only when it helps explain an action.' },
  { id: 'settling', name: 'Follow through', rule: 'Let movement settle without distracting repeated overshoot.' },
  { id: 'rhythm', name: 'Rhythm', rule: 'Coordinate related elements with a consistent stagger.' },
  { id: 'restraint', name: 'Restraint', rule: 'Use the smallest movement that communicates the change.' },
  { id: 'performance', name: 'Performance', rule: 'Prefer transform and opacity; profile expensive morphs.' },
  { id: 'accessibility', name: 'Accessibility', rule: 'Preserve meaning and operation when motion is reduced.' },
] as const;

export function generateMotionPrinciples(preset: MotionPreset, config: MotionConfig): string {
  const rules = [
    'Animate the actual state change; keep unrelated elements still.',
    `Keep the selected ${config.parameters.duration}ms duration and exact runtime values. Do not silently substitute other timing tokens.`,
    'Interrupt and retarget from the current visible state when input changes; avoid snapping back to the starting pose.',
    'Do not add anticipation, extra bounce or decorative loops beyond the configured motion.',
    'In production, trigger on the specified event. Preview autoplay is a demonstration, not an instruction to replay entrances indefinitely.',
  ];
  if (config.sequence) rules.push('Reveal title, image and supporting sections in reading order. Preserve each section’s title/description grouping. For long content, reveal newly visible sections rather than delaying the entire page behind one long sequence.');
  if (preset.trigger === 'press' || preset.trigger === 'hover' || preset.trigger === 'change') rules.push('Start feedback on input immediately. Keep the control usable during settling; do not wait for the animation to execute its action.');
  if (preset.category === 'feedback') rules.push('Pair feedback with a readable status or error message; motion alone must not communicate the outcome.');
  if (preset.category === 'exit') rules.push('Keep focus and a valid destination when content is removed. Do not block navigation while exit motion completes.');
  if (config.parameters.origin) rules.push('Use the selected origin consistently for travel and scale; end at the existing component’s final position.');
  if (preset.previewType === 'navigation') rules.push('Maintain object identity across sidebar states. Keep text at its normal scale; stage richer modal content after the shell begins opening. Profile clip/reveal geometry on target devices and use a simpler transition if frames drop.');
  if (preset.trigger === 'continuous') rules.push('Run loading motion only while work is pending. Stop on completion, when hidden or offscreen; avoid announcing every animation cycle.');
  rules.push('With reduced motion, remove travel, scale, rotation and stagger delays. Show the final state immediately or with a brief fade; preserve focus, labels and interaction.');
  return `Motion principles:\n${rules.map(rule => `- ${rule}`).join('\n')}`;
}
