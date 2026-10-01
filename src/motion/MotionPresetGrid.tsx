import { useState } from 'react';
import { motionConfig } from './config';
import { label, type MotionPreset } from './presets';
import { MotionPreview } from './MotionPreview';
export function MotionPresetGrid({ presets, selectedId, onSelect }: { presets: MotionPreset[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return <div className="ml-grid">{presets.map(preset => <button key={preset.id} className="ml-preset-card" aria-pressed={preset.id === selectedId} onPointerEnter={() => setHoveredId(preset.id)} onPointerLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(preset.id)} onBlur={() => setHoveredId(null)} onClick={() => onSelect(preset.id)}><MotionPreview enabled={hoveredId === preset.id} preset={preset} config={motionConfig(preset, preset.defaultParameters)} /><span className="ml-card-caption"><strong>{preset.name}</strong><small>{label(preset.category)} · {label(preset.targets[0] === 'navigation' ? 'sidebar' : preset.targets[0])}</small></span></button>)}</div>;
}
