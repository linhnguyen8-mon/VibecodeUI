import { resolveEasing } from './easing';
import { parameterRegistry } from './parameters';
import { contentSwapTokens } from './contentSwap';
import { advancedCardPrompt } from './cardPrompt';
import type { MotionPreset } from './presets';
import type { MotionConfig } from './config';
import { easingMap } from './config';

export function generateMotionPrompt(preset: MotionPreset, config: MotionConfig): string {
  const p = config.parameters;
  if (['number-roll', 'text-swap', 'highlight-sweep'].includes(preset.behavior)) {
    const motion = preset.parameterSchema.map(key => { const spec = parameterRegistry[key], value = p[key]; return `- ${spec.label}: ${typeof value === 'number' && spec.format ? spec.format(value) : value}`; });
    const sequence = preset.behavior === 'number-roll'
      ? 'Present the real number as one continuous counter inside a single shared card, without separate digit surfaces. Compare old/new values by digit; animate only changed digits when enabled. Roll outgoing digits in Roll direction and incoming digits from the opposite side through fixed overflow-hidden masks, settling at the same baseline. Stagger from least significant to most significant using Digit stagger. Keep unchanged digits still; never animate the counter width.'
      : preset.behavior === 'text-swap'
      ? 'Keep both states overlaid in a stable text slot. Move the outgoing line in Direction toward Exit opacity; bring the new line from the opposite side to opacity 1. Start incoming at Duration × (1 − Overlap), where 100% overlap means simultaneous. Permit small text length differences without resizing the slot.'
      : 'Show the real paragraph fully before highlighting. Highlight only the phrase “a little curiosity”: wait Delay, then reveal a yellow background across that phrase in Sweep direction using separate measured line fragments. Reveal each fragment from 0% to 100% in reading order; finish the upper line before starting the next, retain all completed fragments, and allocate Duration proportionally to each line fragment width. Re-measure after responsive wrapping; never reveal all lines simultaneously. Let the highlighted phrase wrap naturally across lines with box-decoration-break: clone; do not use inline-block, nowrap or change text geometry. Use Intensity as background opacity. Keep the finished highlight permanently visible; do not sweep it off the phrase or fade it away. The paragraph remains stationary.';
    return [`Apply the **"${preset.name}"** motion preset to the existing content component.`, `## Motion\n\n${motion.join('\n')}`, `## Trigger and sequence\n\nRun on a value/content update or explicit activation. ${sequence}`, '## Runtime rules\n\n- Preserve existing content and stable layout. Number Roll uses real digits in one card; Highlight Sweep uses a real paragraph, visible before the highlight begins. Text Swap uses skeleton shapes only in the library demo.\n- Derive travel and masks from real geometry. Animate transform and opacity, keep text at normal scale, use the existing animation stack.\n- Retarget from the current visible state for rapid updates. Keep focus and accessible reading order stable.\n- Do not autoplay production replacements; highlight loops require explicit opt-in.', '## Accessibility\n\nRespect prefers-reduced-motion: replace values/text immediately and skip highlight travel. Announce meaningful updates appropriately without moving focus.'].join('\n\n');
  }
  if (preset.behavior === 'content-swap') {
    const t = contentSwapTokens(p);
    return [`Apply the **"${preset.name}"** motion preset to the existing content component.`,
      `## Motion\n\n- Duration per transition: ${t.duration}ms\n- Travel: ${t.distance}px\n- Headline stagger: ${t.stagger}ms\n- Easing: ${t.easing}`,
      `## Trigger and sequence\n\n- On CTA click/tap, give ${t.press}ms scale-down/release feedback first. Keep the CTA at a fixed position and never replace it or its label. Keep the label “Continue” unchanged.\n- At ${t.tagStart}ms, keep the tag pill shell fixed; slide its old inner label left while fading out and reveal the new label from the right with ${Math.round(t.duration * .15)}ms overlap offset.\n- At ${t.headlineStart}ms, animate headline word chunks in reading order, left to right then top to bottom. Old chunks move up and fade out; new chunks rise from below and fade in, offset ${Math.round(t.duration * .25)}ms after each old chunk starts.\n- At ${t.descriptionStart}ms, reveal the new description with opacity and ${t.distance * .5}px upward travel, as the headline nears completion. Settle at ${t.total}ms.`,
      '## Runtime rules\n\n- Preserve existing real content and styling. Center the tag, 2–3 headline rows, description and CTA. This demo uses real travel-themed text; no icons or illustrations. Keep tag and CTA shells unchanged between states. Replace only the tag label; CTA remains “Continue”.\n- Overlay outgoing and incoming states in fixed layout slots. Allow small length changes without moving the CTA or causing layout jumps.\n- Animate transform and opacity with the existing animation stack. Keep content at normal scale; only the CTA press uses subtle scale.\n- Serialize rapid activations during replacement, preserve focus on the CTA and commit the new state after settlement. Do not autoplay production content swaps.',
      '## Accessibility\n\nRespect prefers-reduced-motion: replace content immediately without travel or stagger. Keep the CTA keyboard operable and announce meaningful content changes without moving focus.'].join('\n\n');
  }
  if (config.advancedCard) return advancedCardPrompt(preset, config.advancedCard);
  if (config.swipe) {
    const t = config.swipe;
    const direction = t.vertical ? t.direction === 'forward' ? 'up / next' : 'down / previous' : t.direction === 'forward' ? 'left / next' : 'right / previous';
    return [`Apply the **"${preset.name}"** motion preset to the existing card collection.`,
      `## Motion\n\n- Direction: ${direction}\n- ${t.vertical ? 'Drag scale' : 'Side card scale'}: ${t.scale}\n- Visible peek: ${t.peek}px\n- Snap strength: ${t.strength}×\n- Transition duration: ${t.duration}ms`,
      `## Trigger\n\nFollow ${t.vertical ? 'vertical' : 'horizontal'} pointer/touch drag directly. Release snaps to the nearest eligible card.`,
      `## State transitions\n\n${t.vertical ? '- Rest at scale 1, filling nearly the viewport. During drag, compress toward Drag scale continuously with gesture displacement while the next card enters. Cross 25% of the measured card stride to select the adjacent card. Below threshold or on cancel, keep the current card. On release, settle position and expand the selected card back to scale 1; never leave it compressed at rest.' : '- Rest with the active card centered at scale 1, opacity 1 and highest layer. Preserve a peek of both adjacent cards. During drag, compute scale continuously: 1 − (1 − sideScale) × min(1, abs(distanceToCenter) / cardStride). Reduce side opacity only slightly (to 0.92). On release, snap to the nearest card; beyond 25% of stride, select the adjacent card. Cancel restores the current card.'}`,
      '## Runtime rules\n\n- Preserve existing content and layout; skeleton is only the demo representation.\n- Derive card stride and center from real viewport geometry, with stable layout boxes. Animate transform and opacity.\n- Bind direction, scale, peek, snap strength and duration to the same tokens used by the preview.\n- Keep drag coupled directly to pointer displacement. Use a restrained, critically damped settling curve on release; stronger snap strength settles more quickly within the selected duration. No strong bounce.\n- Allow a new gesture to interrupt from the current visible position. Handle pointer cancellation and viewport resizing.\n- Keep inactive cards operable through accessible navigation; provide previous/next actions and keyboard support, and maintain focus on selection.\n- Use the existing stack; do not add a dependency unless required.',
      '## Accessibility\n\nRespect prefers-reduced-motion: switch selection immediately, omit travel and compression, and preserve visible focus. Demo autoplay is explanatory only; do not autoplay the production collection.'].join('\n\n');
  }

  const magic = preset.id === 'magic-button';
  const press = preset.behavior === 'press' || preset.behavior === 'depth-press';
  const progress = preset.behavior === 'progress-sweep';
  const content = !!config.sequence;
  const expand = preset.behavior === 'button-expand';
  const target = preset.previewType === 'list' ? 'content' : preset.previewType;
  const finalState = preset.behavior === 'mobile-modal-expand' ? 'full-screen mobile modal with additional fields below its original header' : expand ? 'primary button aligned left; two secondary buttons visible on the right' : preset.behavior === 'sidebar-expand' ? 'centered modal at its existing destination geometry'
    : preset.behavior === 'sidebar-collapse' ? 'compact, operable navigation rail'
    : preset.previewType === 'navigation' ? 'translateX(0)'
    : progress ? 'complete fill with a centered check after confirmed success'
    : press || preset.behavior === 'pulse' ? 'original resting pose'
    : preset.category === 'exit' ? 'hidden / removed after exit completes'
    : preset.trigger === 'continuous' ? 'repeat while active'
    : 'existing position and size (identity transform)';
  const motion = [`Behavior: ${preset.description}`, `Duration: ${p.duration}ms`];
  if (p.easing === 'spring' && config.duration !== p.duration && p.hold === undefined) motion.push(`Settling duration: ${config.duration}ms`);
  motion.push(`Profile: ${p.easing}`);
  if (p.easing !== 'spring') motion.push(`Easing: ${preset.category === 'exit' && p.easing === 'smooth' ? 'cubic-bezier(0.42, 0, 0.58, 1)' : resolveEasing(p)}`);
  if (p.bounce !== undefined) motion.push(`Bounce: ${p.bounce}%`);
  motion.push(`Intensity: ${p.intensity}`);
  if (p.distanceX !== undefined) motion.push(`Move X: ${p.distanceX}px (positive enters from left; negative enters from right)`, `Move Y: ${p.distance ?? 0}px`);
  else if (p.distance !== undefined) motion.push(`Distance: ${p.distance}px`);
  if (p.scale !== undefined) motion.push(`Scale: ${preset.category === 'exit' ? `1 → ${p.scale}` : press || preset.behavior === 'pulse' ? `1 → ${p.scale} → 1` : `${p.scale} → 1`}`);
  if (p.depth !== undefined) motion.push(`Press depth: ${p.depth}px`);
  if (p.origin) motion.push(`Origin: ${p.origin}`, `Transform origin: ${config.transformOrigin}`);
  if (content || expand || preset.behavior === 'mobile-modal-expand') motion.push(`Stagger: ${p.stagger}ms`);
  if (p.hold !== undefined) motion.push(`Hold: ${p.hold}ms (simulated press interval in autoplay)`, `Total playback duration: ${config.duration}ms`);
  if (p.repeatDelay !== undefined) motion.push(`Repeat pause: ${p.repeatDelay}ms`);
  motion.push(`Final state: ${finalState}`, `Opacity: ${preset.category === 'exit' && p.opacity ? 0 : 1}${p.opacity ? ' (fade enabled)' : ''}`);
  if (magic) motion.push(`Gradient cycle: ${p.duration * 6}ms, infinite while visible`);

  const triggers = { enter: 'enter / open', exit: 'exit / close', press: 'pointer-down or Enter/Space key-down; restore on release, cancel or blur', hover: 'pointer enter / focus; restore on leave / blur', change: 'confirmed state change', continuous: 'while the associated state is active' };
  const rules = [
    'Apply to the existing component; preserve layout, styling and real content. Skeleton shapes are preview placeholders only.',
    'Resolve the start position from the component’s real geometry. Do not use fixed preview transforms or sampled keyframes.',
    'Prefer transform and opacity; avoid layout-shifting properties.',
    'Keep text, icons and fields at normal scale during structural morphs.',
    'Motion must be interruptible and retarget from the current visible state.',
    `Keep the selected ${p.duration}ms duration and configured parameters.${p.easing === 'spring' ? ' Use the spring profile rather than linear interpolation of sampled frames.' : ''}`,
    `Do not add anticipation${(p.bounce ?? 0) === 0 ? ', overshoot' : ''}, extra bounce${content || expand || preset.behavior === 'mobile-modal-expand' ? '' : ', stagger'}${preset.trigger === 'continuous' || magic ? '' : ', or looping'} beyond the configured motion.`,
    'Use the project’s existing animation stack; do not add a dependency unless required.',
  ];
  const transitions: string[] = [];
  if (preset.behavior === 'mobile-modal-expand') transitions.push('Begin with the existing small modal at the bottom of the mobile viewport. Expand its shell toward full-screen from the selected origin (bottom-left by default). Resolve both rectangles from real viewport geometry. The expanded shell fills the viewport edge to edge with no outer gap; apply safe-area insets only to its inner content. Keep the outer gap only in the collapsed state. Keep header text at normal scale and move it continuously with the shell; reveal additional fields below it after expansion starts, using the configured stagger. Do not stretch content or copy fixed preview clip dimensions. Profile shell reveal geometry on target devices; use a simpler transition if needed. Trap focus while open, support Escape/close, restore focus on dismissal, and allow scrolling when expanded content exceeds the viewport.');
  if (expand) transitions.push('Use compact square icon buttons with accessible names. On activation, preserve the primary button’s identity and move it from the centered resting position to the left alignment of its action group. Calculate the travel from real group and button geometry, never from the miniature preview. Begin revealing two secondary buttons after the primary starts moving, using the configured stagger. Keep the action group layout stable. On deactivation, hide secondary actions and return the primary to center; move focus back to it before hiding a focused action. Hidden secondary actions must not receive pointer events or keyboard focus. The initial preview pause is for demonstration only; production responds immediately.');
  if (content) transitions.push('Reveal title first, then image and sections in reading order, keeping the outer container stationary. Keep each section’s title and short description together; stagger newly visible sections instead of delaying an entire long page.');
  if (preset.previewType === 'navigation') transitions.push('Resolve actual sidebar/modal bounding boxes. Preserve object identity, animate the shell first, then reveal additional content without distorting text. Keep focus and navigation actions operable.');
  if (preset.behavior === 'press') transitions.push('Start scale-down within at most 80ms to confirm the press before other visual transitions. Hold while pressed and restore on release. Do not delay the underlying action until animation completes.');
  if (preset.behavior === 'depth-press' && !magic) transitions.push(`Move the face down ${p.depth}px and reduce the solid lower shadow from ${(p.depth ?? 4) + 1}px to 1px, then restore. Prefer a fixed base under the moving face; profile any shadow animation.`);
  if (magic) transitions.push(`Use three layers: blurred rainbow shadow (12px blur, 0.7 opacity), fixed rainbow edge, solid front face. Rest the face ${(p.depth ?? 4)}px above the edge, lift it ${(p.depth ?? 4) + 2}px on hover, and press to ${Math.min(2, (p.depth ?? 4) / 2)}px above it. Shadow offsets: 2px resting, 4px hovering, 1px pressed. Move both gradients from 0% to 200% background-position with 200% background-size. Pause when hidden/offscreen. Use 34ms press, 250ms hover and 600ms release response; preserve the configured duration for the autoplay demo. Do not animate edge height.`);
  if (preset.behavior === 'progress-bar-sweep') transitions.push('Keep the track stationary and clip a fill layer with left-center transform origin. Sweep scaleX from 0 to 1 over Duration in the demo. In production, bind fill to actual task progress, retain a pending state until completion and expose errors on failure; never imply completion solely because a timer elapsed. Use accessible progressbar semantics with meaningful value updates, and announce completion once.');
  if (progress) transitions.push('Sweep the fill from scaleX(0) to scaleX(1) with left-center origin. Duration simulates task time in the demo; production follows actual progress. Reveal the centered check only after confirmed success, never because a timer elapsed. Handle failure, prevent duplicate submissions and announce completion once.');
  if (preset.trigger === 'continuous') transitions.push('Run only while the associated state is active. Pause when hidden/offscreen and stop on completion.');
  if (preset.category === 'feedback') transitions.push('Pair motion with an accessible status or error message; confirm outcomes only when the system has confirmed them.');
  if (preset.category === 'exit') transitions.push('Restore focus to a valid destination when the component is removed; do not block navigation on exit playback.');
  const bullets = (items: string[]) => items.map(item => `- ${item}`).join('\n');
  return [`Apply the **"${preset.name}"** motion preset to the existing ${target} component.`, `## Motion\n\n${bullets(motion)}`, `## Trigger\n\nRun on **${triggers[preset.trigger]}**.`, `## Runtime rules\n\n${bullets(rules)}`, ...(transitions.length ? [`## State transitions\n\n${bullets(transitions)}`] : []), '## Accessibility\n\nRespect `prefers-reduced-motion`: remove travel, scale, rotation, spring motion and stagger delays; show the final state immediately or use a brief opacity-only transition. Stop decorative gradient loops. Preserve focus, labels and interaction.'].join('\n\n');
}
