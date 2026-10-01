import { useCallback, useRef, useState } from 'react';
import { motionPresets, type Target } from './presets';
import { filterPresets, MotionFilters } from './MotionFilters';
import { MotionPresetGrid } from './MotionPresetGrid';
import { MotionDetailPanel } from './MotionDetailPanel';
import './motion.css';
export function MotionLibraryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [target, setTarget] = useState<Target | 'all'>('all');
  const activeTarget = target === 'toggle' || target === 'popover' || target === 'dialog' || target === 'badge' ? 'all' : target === 'list' ? 'content' : target === 'progress' ? 'status' : target === 'navigation' ? 'sidebar' : target;
  const browse = useRef<HTMLDivElement>(null);
  const selected = motionPresets.find(p => p.id === selectedId);
  const filtered = filterPresets(motionPresets, 'all', activeTarget);
  const close = useCallback(() => { setSelectedId(null); const card = browse.current?.querySelector<HTMLButtonElement>('.ml-preset-card[aria-pressed="true"]'); requestAnimationFrame(() => (card ?? browse.current?.querySelector<HTMLButtonElement>('.ml-filters button[aria-pressed="true"]'))?.focus()); }, []);
  return <section className={`ml-layout ${selected ? 'ml-has-panel' : ''}`}><div className="ml-browse" ref={browse}><MotionFilters presets={motionPresets} target={activeTarget} onTarget={setTarget} /><div className="ml-count">{filtered.length} presets</div><MotionPresetGrid presets={filtered} selectedId={selectedId} onSelect={setSelectedId} />{!filtered.length && <div className="ml-empty"><p>No presets match these filters.</p><button onClick={() => { setTarget('all'); }}>Clear filters</button></div>}</div>{selected && <MotionDetailPanel preset={selected} onClose={close} />}</section>;
}
