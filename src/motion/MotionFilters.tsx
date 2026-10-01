import { label, type Category, type MotionPreset, type Target } from './presets';
export function filterPresets(presets: MotionPreset[], category: Category | 'all', target: Target | 'all') {
  return presets.filter(p => (category === 'all' || p.category === category) && (target === 'all' || p.targets.includes(target)));
}
export function MotionFilters({ presets, target, onTarget }: { presets: MotionPreset[]; target: Target | 'all'; onTarget: (value: Target | 'all') => void }) {
  const targets = [...new Set(presets.flatMap(p => p.targets))].filter(value => value !== 'popover' && value !== 'toggle' && value !== 'list' && value !== 'dialog' && value !== 'progress' && value !== 'badge' && value !== 'navigation');
  return <div className="ml-filters"><div role="group" aria-label="Target filter"><span>Target</span>{(['all', ...targets] as const).map(value => <button key={value} aria-pressed={target === value} onClick={() => onTarget(value)}>{label(value)}</button>)}</div></div>;
}
