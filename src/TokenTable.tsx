import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import type { DesignSystem, DesignToken } from './types';
import { editDesignToken, restoreDesignToken, tokenDefinition, tokenGroups, type TokenGroup } from './lib/designTokens';
import { resolveTokenGraph, referenceName } from './lib/tokenGraph';
import { createPortal } from 'react-dom';
import { appThemeColors } from './lib/appTheme';
import './token-editor.css';

function TokenReferencePicker({ ds, tokens, selected, label, onSelect }: { ds: DesignSystem; tokens: DesignToken[]; selected?: string; label: string; onSelect: (name: string) => void }) {
  const [position, setPosition] = useState<{ top: number; left: number; height: number }>();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const values = resolveTokenGraph(ds.tokens);
  const groups = new Map<string, DesignToken[]>();
  for (const token of tokens) {
    const parent = token.name.split('.').slice(0, -1).join(' / ');
    groups.set(parent, [...(groups.get(parent) ?? []), token]);
  }
  const close = () => { setPosition(undefined); trigger.current?.focus(); };
  const open = () => {
    const rect = trigger.current!.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const height = Math.min(360, Math.max(below, rect.top - 12));
    setPosition({ left: Math.max(8, Math.min(rect.right - 300, window.innerWidth - 308)), top: below >= height ? rect.bottom + 4 : Math.max(8, rect.top - height - 4), height });
  };
  useEffect(() => {
    if (!position) return;
    const options = menu.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    (Array.from(options ?? []).find(option => option.getAttribute('aria-selected') === 'true') ?? options?.[0])?.focus();
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setPosition(undefined); };
    const reposition = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setPosition(undefined); };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', reposition); window.removeEventListener('scroll', reposition, true); };
  }, [position]);
  useEffect(() => { setPosition(undefined); }, [ds.id]);
  return <>
    <button ref={trigger} type="button" className="token-reference-trigger" aria-label={label} title="Choose reference" aria-haspopup="listbox" aria-expanded={!!position} aria-controls={position ? id : undefined} onClick={() => position ? close() : open()} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); open(); } }}><ChevronDown size={14} /></button>
    {position && createPortal(<div ref={menu} id={id} className="token-reference-menu" role="listbox" aria-label={label} style={{ ...appThemeColors(ds), top: position.top, left: position.left, maxHeight: position.height }} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key === 'Tab') { close(); return; }
      const options = Array.from(menu.current!.querySelectorAll<HTMLButtonElement>('[role="option"]'));
      const index = options.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'ArrowDown' ? (index + 1) % options.length : event.key === 'ArrowUp' ? (index - 1 + options.length) % options.length : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : undefined;
      if (next !== undefined) { event.preventDefault(); options[next]?.focus(); }
    }}>{[...groups].map(([parent, entries]) => <div key={parent} role="group" aria-label={parent}>
      <div className="token-reference-group">{parent}</div>
      {entries.map(token => <button type="button" role="option" tabIndex={-1} aria-selected={selected === token.name} key={token.name} title={`${token.name}: ${values.get(token.name)}`} onClick={() => { onSelect(token.name); close(); }}>
        {token.category === 'color' && <span className="token-reference-swatch"><span style={{ background: values.get(token.name) }} /></span>}
        <span>{token.name.split('.').at(-1)}</span>
        {token.category !== 'color' && <small>{values.get(token.name)}</small>}
        {selected === token.name && <Check size={14} aria-hidden="true" />}
      </button>)}
    </div>)}</div>, document.body)}
  </>;
}

export function TokenValueEditor({ ds, token, onChange, master = false }: { ds: DesignSystem; token: DesignToken; onChange: (ds: DesignSystem) => void; master?: boolean }) {
  const raw = master ? resolveTokenGraph(ds.tokens).get(token.name)! : token.override ?? token.value;
  const [draft, setDraft] = useState(raw);
  const [error, setError] = useState('');
  const id = useId();
  useEffect(() => { setDraft(raw); setError(''); }, [raw, token.value, token.override, ds.id]);
  const commit = (value: string) => {
    setDraft(value);
    try { const next = editDesignToken(ds, token.name, value, master ? 'master' : 'override'); onChange(next); if (master) setDraft(resolveTokenGraph(next.tokens).get(token.name)!); setError(''); }
    catch (reason) { setError((reason as Error).message); }
  };
  const definition = tokenDefinition(token);
  const refs = ds.tokens.filter(t => t.name !== token.name && t.category === token.category && (!token.valueKind || !t.valueKind || token.valueKind === t.valueKind && (token.valueKind !== 'number' || token.unit === t.unit))); 
  const options = token.valueKind === 'boolean' ? ['true','false'] : token.name.endsWith('density') ? ['comfortable','compact','spacious'] : token.name === 'foundation.background.mode' ? ['light','soft','gradient'] : token.name === 'foundation.contrastMode' ? ['standard','enhanced'] : token.name.endsWith('fontFamily') ? ['Inter','Plus Jakarta Sans','Nunito Sans','IBM Plex Sans'] : undefined;
  return <div className="token-value-editor">
    <div className="token-value-fields">
      {token.category === 'color' && token.opacity !== undefined && <span className="token-reference-swatch"><span style={{ background: resolveTokenGraph(ds.tokens).get(token.name) }} /></span>}
      {token.category === 'color' && !referenceName(draft) && /^#[\da-f]{6}$/i.test(draft) && <input type="color" aria-label={`${token.name} color`} value={draft} onChange={e => commit(e.target.value)} />}
      <div className="token-value-input-shell">
      {options ? <select aria-label={`${token.name} value`} value={draft} onChange={e => commit(e.target.value)}>{[...new Set([draft,...options])].map(value => <option key={value}>{value}</option>)}</select> : <input type={token.valueKind === "number" && !referenceName(draft) ? "number" : "text"} step="any" min={definition.min} max={definition.max} aria-label={`${token.name} value`} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} value={referenceName(draft) ? resolveTokenGraph(ds.tokens).get(token.name)! : token.valueKind === "number" ? draft.replace(new RegExp(`${token.unit ?? ""}$`), "") : draft} spellCheck={false} onChange={e => commit(token.valueKind === "number" && !referenceName(draft) ? `${e.target.value}${token.unit ?? ""}` : e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { setDraft(raw); setError(''); } }} />}
      {token.valueKind === "number" && !referenceName(draft) && token.unit && <span className="token-unit">{token.unit}</span>}
      <TokenReferencePicker ds={ds} tokens={refs} selected={referenceName(draft)} label={`${token.name} reference`} onSelect={name => commit(`ref:${name}`)} />
      </div>
    </div>
    {error ? <small role="alert" id={`${id}-error`}>{error}</small> : master && token.override !== undefined ? <small>Override active · master source: {token.value}</small> : master && referenceName(token.value) ? <small>Linked to {referenceName(token.value)}</small> : definition.unit && master ? <small>Unit: {definition.unit}</small> : null}
  </div>;
}

export function TokenTable({ ds, onChange, group, onGroupChange }: { ds: DesignSystem; onChange: (ds: DesignSystem) => void; group: TokenGroup | 'All'; onGroupChange: (group: TokenGroup | 'All') => void }) {
  const [query,setQuery] = useState('');
  const [sectionKey, setSectionKey] = useState('All');
  const [layer, setLayer] = useState<'Primitive' | 'Semantic' | 'Component'>('Semantic');
  useEffect(() => { setSectionKey('All'); }, [group, layer, ds.id]);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const layerOrder = ['Primitive', 'Semantic', 'Component'] as const;
  const available = ds.tokens.filter(token => !token.name.startsWith('foundation.background.') && !['foundation.density', 'foundation.contrastMode'].includes(token.name) && (group === 'All' || tokenDefinition(token).group === group));
  const activeLayer = layer;
  useEffect(() => {
    if (!available.some(token => tokenDefinition(token).layer === layer)) {
      const next = layerOrder.find(candidate => available.some(token => tokenDefinition(token).layer === candidate));
      if (next) setLayer(next);
    }
  }, [group, ds.id]);
  useEffect(() => { setQuery(''); }, [group]);
  const values = resolveTokenGraph(ds.tokens);
  const rows = ds.tokens.filter(token => tokenDefinition(token).layer === activeLayer && !token.name.startsWith('foundation.background.') && !['foundation.density', 'foundation.contrastMode'].includes(token.name) && (group === 'All' || tokenDefinition(token).group === group) && token.name.toLowerCase().includes(query.toLowerCase()));
  const sections = new Map<string, { label: string; layer: 'Primitive' | 'Semantic' | 'Component'; tokens: DesignToken[] }>();
  for (const token of rows) {
    const { group: category, layer } = tokenDefinition(token);
    const segment = category === 'Layout'
      ? /(?:^|\.)gap$/i.test(token.name) ? 'gap'
        : /(?:^|\.)padding$/i.test(token.name) ? 'padding'
        : /(?:^|\.)margin$/i.test(token.name) ? 'margin'
        : token.name.startsWith('spacing.') ? 'spacing' : 'settings'
      : token.name.split('.')[1] ?? category;
    const label = segment.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, letter => letter.toUpperCase());
    const key = group === 'All' ? `${layer}.${category}` : `${layer}.${category}.${segment}`;
    if (!sections.has(key)) sections.set(key, { label: group === 'All' ? category : label, layer, tokens: [] });
    sections.get(key)!.tokens.push(token);
  }
  const orderedSections = [...sections].sort((a, b) => layerOrder.indexOf(a[1].layer) - layerOrder.indexOf(b[1].layer));
  return <section className="token-table-panel" aria-label="Design system tokens">
    <div className="token-layer-tabs" role="tablist" aria-label="Token layers">{layerOrder.map((candidate, index) => <button key={candidate} ref={element => { tabs.current[index] = element; }} id={`token-tab-${candidate}`} type="button" role="tab" aria-selected={activeLayer === candidate} aria-controls="token-layer-panel" tabIndex={activeLayer === candidate ? 0 : -1} onClick={() => { setLayer(candidate); setQuery(''); }} onKeyDown={event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : undefined;
      if (next !== undefined) { event.preventDefault(); setLayer(layerOrder[next]); setQuery(''); tabs.current[next]?.focus(); }
    }}>{candidate}<span>{available.filter(token => tokenDefinition(token).layer === candidate).length}</span></button>)}</div>
    <div id="token-layer-panel" role="tabpanel" aria-labelledby={`token-tab-${activeLayer}`}>
    <div className="token-toolbar">
    <div className="token-group-options" role="group" aria-label="Token group">{(['All', ...tokenGroups] as const).map(candidate => <button key={candidate} type="button" aria-pressed={group === candidate} onClick={() => onGroupChange(candidate)}>{candidate}</button>)}</div>
      <label className="token-search"><Search size={15} aria-hidden="true" /><input type="search" aria-label="Search tokens" placeholder="Search token name…" value={query} onChange={e => { setQuery(e.target.value); setSectionKey('All'); }} /></label>

    </div>
    <div className="token-table-body">
    <nav className="token-section-nav" aria-label="Token subgroups"><button type="button" aria-pressed={sectionKey === 'All'} onClick={() => setSectionKey('All')}>All groups<span>{rows.length}</span></button>{orderedSections.map(([key, section]) => <button key={key} type="button" aria-pressed={sectionKey === key} onClick={() => setSectionKey(key)}>{section.label}<span>{section.tokens.length}</span></button>)}</nav>
    <div className="token-table-scroll" tabIndex={0} aria-label="Scrollable token table"><table className={group === 'Typography' ? 'token-typography-table' : undefined}><thead><tr><th>Token</th><th>Value / Reference</th><th>Value</th><th>Status</th></tr></thead>{orderedSections.filter(([key]) => sectionKey === 'All' || key === sectionKey).map(([key, section]) => <tbody key={key}>{section.tokens.some(token => token.name.startsWith('foundation.typography.roles.')) && <tr className="token-section-heading"><th colSpan={group === 'Typography' ? 2 : 4}><code>foundation.typography.roles</code></th></tr>}{section.tokens.map(token => {
      const roleMatch = token.name.match(/^foundation\.typography\.roles\.([^.]+)\.(size|lineHeight|weight)$/);
      if (roleMatch) {
        const roleTokens = ['size', 'lineHeight', 'weight'].map(property => section.tokens.find(candidate => candidate.name === `foundation.typography.roles.${roleMatch[1]}.${property}`)).filter((candidate): candidate is DesignToken => !!candidate);
        if (token !== roleTokens[0]) return null;
        const fieldLabel = (name: string) => name.endsWith('.size') ? 'Size' : name.endsWith('.lineHeight') ? 'Line height' : 'Weight';
        return <tr key={roleMatch[1]} className="token-typography-row"><th scope="row"><code title={`foundation.typography.roles.${roleMatch[1]}`}>{roleMatch[1]}</code></th>
          <td><div className="token-typography-fields">{roleTokens.map(field => <div key={field.name}><span className="token-typography-label">{fieldLabel(field.name)}</span><TokenValueEditor ds={ds} token={field} onChange={onChange} /></div>)}</div></td>
          <td><div className="token-typography-values">{roleTokens.map(field => <div key={field.name}><span className="token-typography-label">{fieldLabel(field.name)}</span><code>{values.get(field.name)}</code></div>)}</div></td>
          <td><div className="token-typography-statuses">{roleTokens.map(field => <div key={field.name}><span className="token-typography-label">{fieldLabel(field.name)}</span><span className={`token-status ${field.override !== undefined ? 'is-override' : ''}`}>{field.override !== undefined ? 'Override' : 'Linked'}</span>{field.override !== undefined && <button type="button" aria-label={`Restore link ${field.name}`} onClick={() => onChange(restoreDesignToken(ds, field.name))}>Restore link</button>}</div>)}</div></td></tr>;
      }
      const displayName = token.name.startsWith('foundation.typography.roles.') ? token.name.slice('foundation.typography.roles.'.length) : token.name;
      return <tr key={token.name}><th scope="row"><code title={token.name}>{displayName}</code></th><td><TokenValueEditor ds={ds} token={token} onChange={onChange} /></td><td><code>{values.get(token.name)}</code></td><td><span className={`token-status ${token.override !== undefined ? 'is-override' : ''}`}>{token.override !== undefined ? 'Override' : 'Linked'}</span>{token.override !== undefined && <button type="button" aria-label={`Restore link ${token.name}`} onClick={() => onChange(restoreDesignToken(ds,token.name))}>Restore link</button>}</td></tr>;
    })}</tbody>)}</table>{!rows.length && <p className="token-empty">No matching tokens. Try another group or clear your filters.</p>}</div></div></div>
  </section>;
}
