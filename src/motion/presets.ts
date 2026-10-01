import { advancedCardSchemas } from './cardMotion';
export const categories = ['entrance', 'exit', 'interaction', 'feedback', 'overlay', 'loading', 'attention'] as const;
export type Category = typeof categories[number];
export type Target = 'button' | 'input' | 'card' | 'list' | 'content' | 'modal' | 'dialog' | 'popover' | 'sidebar' | 'bottom-sheet' | 'navigation' | 'toggle' | 'status' | 'badge' | 'progress' | 'skeleton';
export type MotionOrigin = 'center' | 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
export type Parameters = { duration: number; rollDirection?: 'up' | 'down'; digitStagger?: number; rollDistance?: number; changedDigitsOnly?: boolean; swapDirection?: 'left' | 'right' | 'up' | 'down'; swapDistance?: number; overlap?: number; exitOpacity?: number; sweepDirection?: 'left' | 'right'; sweepWidth?: number; sweepIntensity?: number; repeatMode?: 'once' | 'loop'; fanSpread?: number; fanHeight?: number; arcDepth?: number; sideRotation?: number; inactiveScale?: number; activeLift?: number; swipeSensitivity?: number; dismissDirection?: 'horizontal' | 'left' | 'right' | 'free'; threshold?: number; rotationIntensity?: number; exitDistance?: number; velocitySensitivity?: number; returnSpring?: number; flipAxis?: 'x' | 'y'; perspective?: number; rotationDirection?: 'clockwise' | 'counterclockwise'; midpointScale?: number; enterDirection?: 'bottom' | 'top' | 'left' | 'right'; startOpacity?: number; startScale?: number; delay?: number; triggerMode?: 'once' | 'repeat'; direction?: 'forward' | 'backward'; cardScale?: number; peek?: number; snapStrength?: number; depth?: number; origin?: MotionOrigin; distance?: number; distanceX?: number; stagger?: number; bounce?: number; hold?: number; repeatDelay?: number; scale?: number; opacity?: boolean; bezierX1?: number; bezierY1?: number; bezierX2?: number; bezierY2?: number; easing: keyof typeof import('./easing').easingMap; intensity: 'subtle' | 'normal' | 'expressive' };
export type Parameter = keyof Parameters;
export type Behavior = 'number-roll' | 'text-swap' | 'highlight-sweep' | 'content-swap' | keyof typeof advancedCardSchemas |  'horizontal-card-focus' | 'vertical-card-compress' | 'mobile-modal-expand' | 'button-expand' | 'progress-bar-sweep' | 'progress-sweep' | 'depth-press' | 'fade' | 'vertical' | 'horizontal' | 'scale' | 'press' | 'lift' | 'toggle' | 'pulse' | 'shake' | 'shimmer' | 'spin' | 'sidebar-expand' | 'sidebar-collapse';
export type MotionPreset = { id: string; name: string; description: string; category: Category; targets: Target[]; previewType: Target; behavior: Behavior; defaultParameters: Parameters; parameterSchema: Parameter[]; trigger: 'enter' | 'exit' | 'press' | 'hover' | 'change' | 'continuous'; prompt: string };
function preset(id: string, name: string, category: Category, targets: Target[], behavior: Behavior, trigger: MotionPreset['trigger'], values: Partial<Parameters> = {}): MotionPreset {
  const descriptions: Record<Behavior, string> = {
    'number-roll': 'Roll only changed digits vertically inside fixed masks, with a small least-significant-first stagger.',
    'text-swap': 'Replace a text line with overlapping directional slide and fade while keeping its layout slot fixed.',
    'highlight-sweep': 'Sweep a soft highlight across stationary content once after an update.',
    'content-swap': 'Press a fixed CTA, swap the tag, stagger headline chunks out/up and in/from below, then reveal the description.',
    'stack-fan-swipe': 'Swipe a fan of cards; the incoming card rises into focus while side cards follow an arc.',
    'swipe-dismiss': 'Drag or flick the active card away; below threshold it settles back, otherwise the next card advances.',
    'flip-reveal': 'Flip a stable card frame to reveal its back without mirrored content.',
    'stack-card-cycle': 'Cycle through layered cards with offset, gently rotated colored backs and a full-size front card.',
    fade: category === 'exit' ? 'Fade the element away smoothly.' : 'Reveal the element with a soft opacity transition.',
    vertical: category === 'exit' ? 'Move the element down as it leaves.' : 'Reveal the element with a gentle upward slide.',
    horizontal: category === 'exit' ? 'Slide the element away horizontally.' : 'Bring the element into view with a horizontal slide.',
    scale: category === 'exit' ? 'Shrink the element slightly as it fades away.' : 'Reveal the element with a subtle scale transition.',
    'horizontal-card-focus': 'Drag cards horizontally with continuous center-distance scaling, then gently snap the nearest card to center.',
    'vertical-card-compress': 'Compress the active fullscreen card during vertical drag, then restore the selected card to fullscreen on release.',
    'mobile-modal-expand': 'Expand a small mobile modal from the bottom-left into a full-screen surface, then reveal additional fields below its existing header.',
    'button-expand': 'Move the centered primary button to the left when active, then reveal two secondary actions on the right.',
    'progress-bar-sweep': 'Fill a horizontal progress bar from left to right until the task completes.',
    'progress-sweep': 'Sweep progress across the button, then reveal a centered check only after the work completes.',
    'depth-press': 'Press the raised button face downward while reducing its solid lower shadow, then release back to its resting height.',
    press: 'A quick scale-down confirms the press immediately, before any subsequent visual transition. Hold while pressed, then return smoothly on release.',
    lift: 'Lift the component gently to acknowledge hover.',
    toggle: 'Slide the toggle thumb into its active position.',
    pulse: 'Draw attention with a gentle scale pulse.',
    shake: 'Use a short horizontal shake to signal an error.',
    shimmer: 'Sweep a soft highlight across placeholder content while loading.',
    'sidebar-expand': 'Expand the existing sidebar into a centered modal while preserving visual continuity.',
    'sidebar-collapse': 'Collapse the existing sidebar into a compact icon rail.',
    spin: 'Rotate a compact indicator while work is in progress.',
  };
  const description = descriptions[behavior];
  const defaultParameters: Parameters = {
    duration: 400,
    easing: category !== 'exit' && ['scale', 'vertical', 'horizontal', 'toggle', 'sidebar-expand', 'sidebar-collapse'].includes(behavior) ? 'spring' : 'smooth', intensity: 'normal',
    ...(['press', 'depth-press', 'lift', 'pulse'].includes(behavior) ? { hold: behavior === 'lift' ? 160 : behavior === 'pulse' ? 80 : 40 } : {}),
    ...(trigger === 'continuous' ? { repeatDelay: behavior === 'pulse' ? 1200 : 0 } : {}),
    ...(category !== 'exit' && ['scale', 'vertical', 'horizontal', 'toggle', 'sidebar-expand', 'sidebar-collapse'].includes(behavior) ? { bounce: values.easing === 'spring' ? 15 : 0 } : {}),
    ...values,
  };
  return { id, name, category, targets, previewType: id === 'list-reveal' ? 'list' : id === 'spinner' ? 'progress' : targets[0], behavior, trigger, description, prompt: description, defaultParameters, parameterSchema: behavior === 'number-roll' ? ['rollDirection', 'digitStagger', 'rollDistance', 'duration', 'easing', 'changedDigitsOnly'] : behavior === 'text-swap' ? ['swapDirection', 'swapDistance', 'overlap', 'exitOpacity', 'duration', 'easing'] : behavior === 'highlight-sweep' ? ['sweepDirection', 'sweepIntensity', 'duration', 'delay', 'repeatMode'] : behavior === 'content-swap' ? ['duration', 'distance', 'stagger', 'easing'] : id in advancedCardSchemas ? [...advancedCardSchemas[id as keyof typeof advancedCardSchemas]] : ['horizontal-card-focus', 'vertical-card-compress'].includes(behavior) ? ['direction', 'cardScale', 'peek', 'snapStrength', 'duration'] : (['direction', 'cardScale', 'peek', 'snapStrength', 'origin', 'duration', 'distance', 'distanceX', 'depth', 'scale', 'opacity', 'easing', 'bounce', 'hold', 'repeatDelay', 'stagger', 'intensity'] as Parameter[]).filter(key => key in defaultParameters) };
}
export const motionPresets: MotionPreset[] = [
  preset('stack-fan-swipe', 'Stack Fan Swipe', 'interaction', ['card'], 'stack-fan-swipe', 'change', { fanSpread: 36, fanHeight: 132, arcDepth: 10, sideRotation: 9, inactiveScale: .92, activeLift: 12, swipeSensitivity: 1, snapStrength: 1 }),
  preset('swipe-dismiss', 'Swipe Dismiss', 'interaction', ['card'], 'swipe-dismiss', 'change', { dismissDirection: 'horizontal', threshold: .3, rotationIntensity: 12, exitDistance: 240, velocitySensitivity: 1, returnSpring: 1 }),
  preset('flip-reveal', 'Flip Reveal', 'interaction', ['card'], 'flip-reveal', 'press', { flipAxis: 'y', perspective: 800, rotationDirection: 'clockwise', midpointScale: .98, easing: 'smooth' }),
  preset('stack-card-cycle', 'Stack Card Cycle', 'interaction', ['card'], 'stack-card-cycle', 'press', { fanSpread: 24, sideRotation: 6, inactiveScale: .85, easing: 'smooth' }),
  preset('horizontal-card-focus', 'Horizontal Card Focus', 'interaction', ['card'], 'horizontal-card-focus', 'change', { direction: 'forward', cardScale: .94, peek: 18, snapStrength: 1 }),
  preset('vertical-card-compress', 'Vertical Card Compress', 'interaction', ['card'], 'vertical-card-compress', 'change', { direction: 'forward', cardScale: .92, peek: 8, snapStrength: 1 }),
  preset('number-roll', 'Number Roll', 'interaction', ['content'], 'number-roll', 'change', { rollDirection: 'up', digitStagger: 25, rollDistance: 36, changedDigitsOnly: true }),
  preset('highlight-sweep', 'Highlight Sweep', 'attention', ['content'], 'highlight-sweep', 'change', { sweepDirection: 'right', sweepIntensity: .7, delay: 650, repeatMode: 'once', easing: 'linear' }),
  preset('staggered-content-swap', 'Staggered Content Swap', 'interaction', ['content'], 'content-swap', 'press', { duration: 400, distance: 10, stagger: 60, easing: 'smooth' }),
  preset('list-reveal', 'List Reveal', 'entrance', ['content', 'list'], 'vertical', 'enter', { distance: 0, distanceX: -12, opacity: true, stagger: 80 }),
  preset('fade-in', 'Fade In', 'entrance', ['content'], 'fade', 'enter', { opacity: true, stagger: 80 }),
  preset('fade-up', 'Fade Up', 'entrance', ['content'], 'vertical', 'enter', { distance: 16, opacity: true, stagger: 80 }),
  preset('slide-out', 'Slide Out', 'exit', ['sidebar'], 'horizontal', 'exit', { distance: 32, opacity: true }),
  preset('button-expand', 'Button Expand Actions', 'interaction', ['button'], 'button-expand', 'press', { duration: 400, easing: 'smooth', stagger: 80 }),
  preset('progress-sweep', 'Progress Sweep', 'interaction', ['button'], 'progress-sweep', 'press', { easing: 'linear' }),
  preset('magic-button', 'Gradient Button Press', 'interaction', ['button'], 'depth-press', 'press', { depth: 4, easing: 'snappy' }),
  preset('button-depth-press', 'Raised Button Press', 'interaction', ['button'], 'depth-press', 'press', { depth: 4, easing: 'snappy' }),
  preset('button-press', 'Button Press', 'interaction', ['button'], 'press', 'press', { scale: .96 }),
  preset('toggle-switch', 'Toggle Switch', 'interaction', ['toggle'], 'toggle', 'change', { distance: 24 }),
  preset('status-pulse', 'Status Pulse', 'feedback', ['status', 'progress'], 'pulse', 'change', { scale: .92 }),
  preset('success-pop', 'Success Pop', 'feedback', ['status'], 'scale', 'change', { scale: .9, opacity: true, easing: 'spring' }),
  preset('error-shake', 'Error Shake', 'feedback', ['input', 'status'], 'shake', 'change', { distance: 5 }),
  preset('mobile-modal-expand', 'Mobile Modal Expand', 'overlay', ['modal'], 'mobile-modal-expand', 'change', { origin: 'bottom-left', easing: 'smooth', stagger: 80 }),
  preset('show-modal', 'Show Modal', 'overlay', ['modal', 'dialog'], 'scale', 'enter', { scale: .96, distance: 32, opacity: true, origin: 'center' }),
  preset('popover-reveal', 'Popover Reveal', 'overlay', ['popover'], 'vertical', 'enter', { distance: 8, opacity: true }),
  preset('bottom-sheet', 'Bottom Sheet', 'overlay', ['bottom-sheet'], 'vertical', 'enter', { distance: 48, opacity: true }),
  preset('sidebar-slide', 'Sidebar Slide In', 'overlay', ['navigation', 'sidebar'], 'horizontal', 'enter', { distance: 32 }),
  preset('sidebar-expand', 'Sidebar to Modal', 'interaction', ['navigation', 'sidebar'], 'sidebar-expand', 'change', { }),
  preset('sidebar-collapse', 'Sidebar Collapse', 'interaction', ['navigation', 'sidebar'], 'sidebar-collapse', 'change', { }),
  preset('skeleton-shimmer', 'Skeleton Shimmer', 'loading', ['skeleton'], 'shimmer', 'continuous', { easing: 'linear' }),
  preset('progress-bar-sweep', 'Progress Bar Sweep', 'loading', ['status'], 'progress-bar-sweep', 'change', { easing: 'linear' }),
  preset('spinner', 'Spinner', 'loading', ['status', 'progress'], 'spin', 'continuous', { easing: 'linear' }),
  preset('badge-pop', 'Badge Pop', 'attention', ['badge'], 'scale', 'change', { scale: .9, easing: 'spring' }),
];
export const label = (value: string) => value.replace(/(^|-)(\w)/g, (_, prefix: string, letter: string) => `${prefix ? ' ' : ''}${letter.toUpperCase()}`);
