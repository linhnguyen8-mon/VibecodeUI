import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, Copy, Check, RotateCcw } from 'lucide-react';
import { changeIntensity, motionConfig } from './config';
import { type MotionPreset, type Parameter, type Parameters } from './presets';
import { generateMotionPrompt } from './prompt';
import { MotionPreview } from './MotionPreview';
import { MotionControls } from './MotionControls';
export function MotionDetailPanel({ preset, onClose }: { preset: MotionPreset; onClose: () => void }) {
  const [draft, setDraft] = useState({ id: preset.id, parameters: { ...preset.defaultParameters } });
  const parameters = draft.id === preset.id ? draft.parameters : preset.defaultParameters;
  const setParameters = (next: Parameters) => setDraft({ id: preset.id, parameters: next });
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const [copyState, setCopyState] = useState('');
  const copyRequest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('keydown', escape); clearTimeout(timer.current); copyRequest.current += 1; };
  }, [onClose]);
  useEffect(() => {
    setPaused(false);
    setDraft({ id: preset.id, parameters: { ...preset.defaultParameters } });
    clearTimeout(timer.current);
    setCopyState('');
    panel.current?.scrollTo({ top: 0 });
    if (window.matchMedia('(max-width: 800px)').matches) panel.current?.scrollIntoView({ block: 'start' });
  }, [preset.id]);
  const config = motionConfig(preset, parameters);
  const prompt = generateMotionPrompt(preset, config);
  useEffect(() => {
    copyRequest.current += 1;
    clearTimeout(timer.current);
    setCopyState('');
  }, [prompt]);
  const update = (name: Parameter, value: Parameters[Parameter]) => {
    setCopyState('');
    setParameters(name === 'intensity' ? changeIntensity(preset, parameters, value as Parameters['intensity']) : { ...parameters, [name]: value });
  };
  const copy = async () => {
    const request = ++copyRequest.current;
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(prompt);
      if (request !== copyRequest.current) return;
      setCopyState('Copied');
      timer.current = setTimeout(() => setCopyState(''), 1800);
    } catch {
      if (request === copyRequest.current) setCopyState('Copy failed. Select the prompt below to copy manually.');
    }
  };
  const reset = () => { setPaused(false); setParameters({ ...preset.defaultParameters }); setCopyState(''); setReplay(n => n + 1); };
  return <aside ref={panel} className="ml-detail" aria-label={`${preset.name} details`}>
    <section className="ml-panel-section ml-pinned-preview" aria-label="Motion preview">
      <div className="ml-detail-preview-card">
        <MotionPreview preset={preset} config={config} replay={replay} paused={paused} />
        <button ref={closeButton} className="ml-preview-close" aria-label="Close motion details" onClick={onClose}><X size={18} /></button>
        <div className="ml-preview-actions">
          <button className="ml-preview-reset" aria-label="Reset to defaults" title="Reset to defaults" onClick={reset}><RotateCcw size={15} aria-hidden="true" /></button>
          <button className="ml-preview-play" aria-label={paused ? "Play motion" : "Pause motion"} title={paused ? "Play motion" : "Pause motion"} aria-pressed={!paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} fill="currentColor" aria-hidden="true" /> : <Pause size={16} fill="currentColor" aria-hidden="true" />}</button>
        </div>
      </div>
    </section>
    <MotionControls preset={preset} parameters={parameters} onChange={update} />
    <section className="ml-panel-section"><div className="ml-section-heading"><h3>Prompt</h3><button onClick={copy}>{copyState === 'Copied' ? <Check size={13} /> : <Copy size={13} />}{copyState === 'Copied' ? 'Copied' : 'Copy Prompt'}</button></div><textarea aria-label="Generated motion prompt" readOnly value={prompt} /><span role="status" className="ml-copy-status">{copyState}</span></section>
  </aside>;
}
