import { useEffect, useId, useRef, useState } from 'react';
import { label, type Parameters } from './presets';
import { parameterRegistry } from './parameters';
const paths: Record<string, string> = {
  hold: 'M3 21H21V3', linear: 'M3 21L21 3',
  'ease-in': 'M3 21C15 21 21 15 21 3',
  'ease-out': 'M3 21C3 9 9 3 21 3',
  'ease-in-and-out': 'M3 21C13 21 11 3 21 3',
  'ease-in-back': 'M3 19C12 24 17 22 21 3',
  'ease-out-back': 'M3 21C7 2 12 0 21 5',
  'ease-in-and-out-back': 'M3 19C13 25 11 -1 21 5',
  'custom-bezier': 'M3 21C4 6 17 18 21 3',
  smooth: 'M3 21C4 5 7 3 21 3', snappy: 'M3 21C3 3 5 3 21 3', spring: 'M3 21C8 -2 12 9 16 4S19 3 21 3',
};
function Curve({ value }: { value: string }) {
  return <svg className="ml-easing-icon" viewBox="0 0 24 24" aria-hidden="true"><path className="ml-easing-grid" d="M3 3V21H21M3 15H21M3 9H21M9 3V21M15 3V21M21 3V21M3 3H21" /><path d={paths[value] ?? paths.linear} /></svg>;
}
export function EasingSelect({ value, onChange }: { value: Parameters['easing']; onChange: (value: Parameters['easing']) => void }) {
  const [open, setOpen] = useState(false), [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const id = useId(), options = parameterRegistry.easing.options!;
  useEffect(() => {
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  useEffect(() => { if (open) root.current?.querySelectorAll<HTMLElement>('[role="option"]')[active]?.scrollIntoView({ block: 'nearest' }); }, [active, open]);
  const select = (option: string) => { onChange(option as Parameters['easing']); setOpen(false); trigger.current?.focus(); };
  return <div className="ml-control ml-easing-select" ref={root}><span id={`${id}-label`}>Easing</span><button type="button" ref={trigger} className="ml-easing-trigger" role="combobox" aria-labelledby={`${id}-label`} aria-controls={`${id}-list`} aria-expanded={open} aria-haspopup="listbox" aria-activedescendant={open ? `${id}-${active}` : undefined} onClick={() => { setActive(options.indexOf(value)); setOpen(v => !v); }} onKeyDown={event => {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(event.key)) event.preventDefault();
    if (event.key === 'Escape') setOpen(false);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { if (!open) { setOpen(true); setActive(options.indexOf(value)); } else setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length); }
    else if (event.key === 'Home') { setOpen(true); setActive(0); }
    else if (event.key === 'End') { setOpen(true); setActive(options.length - 1); }
    else if (event.key === 'Enter' || event.key === ' ') { if (open) select(options[active]); else { setActive(options.indexOf(value)); setOpen(true); } }
  }}><Curve value={value} /><span>{label(value)}</span><span className="ml-easing-chevron">⌄</span></button>{open && <div className="ml-easing-menu" role="listbox" id={`${id}-list`} aria-labelledby={`${id}-label`}>{options.map((option, index) => <div key={option} id={`${id}-${index}`} role="option" aria-selected={option === value} className={index === active ? 'is-active' : ''} onPointerMove={() => setActive(index)} onPointerDown={event => event.preventDefault()} onClick={() => select(option)}><Curve value={option} /><span>{label(option)}</span>{option === value && <span className="ml-easing-check">✓</span>}</div>)}</div>}</div>;
}
