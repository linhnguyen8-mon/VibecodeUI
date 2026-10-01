import { EasingSelect } from './EasingSelect';
import { resolveEasing } from './easing';
import { label, type MotionPreset, type Parameter, type Parameters } from './presets';
import { useId } from 'react';
import { parameterRegistry } from './parameters';

export function MotionParameterControl({ name, value, onChange, labelOverride }: { labelOverride?: string; name: Parameter; value: Parameters[Parameter]; onChange: (value: Parameters[Parameter]) => void }) {
  const controlId = useId();
  const spec = { ...parameterRegistry[name], ...(labelOverride ? { label: labelOverride } : {}) };
  if (name === 'easing') return <EasingSelect value={value as Parameters['easing']} onChange={onChange} />;
  if (spec.kind === 'origin-grid') {
    return <fieldset className="ml-control ml-origin-control">
      <legend>{spec.label}<span>{label(String(value))}</span></legend>
      <div className="ml-origin-grid">
        {spec.options?.map(option => <label className="ml-origin-point" key={option} title={label(option)}>
          <input type="radio" name={controlId} aria-label={label(option)} value={option}
            checked={value === option} onChange={() => onChange(option as Parameters[Parameter])} />
          <span aria-hidden="true"><i /></span>
        </label>)}
      </div>
    </fieldset>;
  }
  if (spec.kind === 'stops') {
    return <fieldset className="ml-control ml-intensity">
      <legend>{spec.label}</legend>
      <div className="ml-intensity-stops">
        {spec.options?.map(option => <label key={option}>
          <input type="radio" name={controlId} value={option} checked={value === option}
            onChange={() => onChange(option as Parameters[Parameter])} />
          <span>{label(option)}</span>
        </label>)}
      </div>
    </fieldset>;
  }
  return <label className="ml-control">
    <span>{spec.label}{spec.kind === 'range' && <output>{spec.format?.(Number(value))}</output>}</span>
    {spec.kind === 'range' ? <>
      <input type="range" aria-label={spec.label} aria-valuetext={spec.format?.(Number(value))}
        min={spec.min} max={spec.max} step={spec.step} value={Number(value)}
        onChange={e => onChange(Number(e.target.value))} />
      <small><span>{spec.format?.(spec.min!)}</span><span>{spec.format?.(spec.max!)}</span></small>
    </> : spec.kind === 'toggle' ?
      <input type="checkbox" role="switch" aria-label={spec.label} checked={Boolean(value)} onChange={e => onChange(e.target.checked)} /> :
      <select aria-label={spec.label} value={String(value)} onChange={e => onChange(e.target.value as Parameters[Parameter])}>
        {spec.options?.map(option => <option key={option} value={option}>{label(option)}</option>)}
      </select>}
  </label>;
}

export function MotionControls({ preset, parameters, onChange }: { preset: MotionPreset; parameters: Parameters; onChange: (name: Parameter, value: Parameters[Parameter]) => void }) {
  return <section className="ml-panel-section"><div className="ml-section-heading"><h3>Motion controls</h3></div>{preset.parameterSchema.map(name => <MotionParameterControl key={name} name={name} labelOverride={name === 'cardScale' && preset.behavior === 'vertical-card-compress' ? 'Drag scale' : name === 'duration' && ['horizontal-card-focus', 'vertical-card-compress'].includes(preset.behavior) ? 'Transition duration' : name === 'distance' && preset.previewType === 'list' ? 'Move Y' : name === 'scale' ? preset.category === 'exit' ? 'Scale to' : preset.behavior === 'press' ? 'Pressed scale' : preset.behavior === 'pulse' ? 'Pulse scale' : undefined : undefined} value={parameters[name]} onChange={value => onChange(name, value)} />)}{preset.parameterSchema.includes('easing') && <><code className="ml-easing-value">{resolveEasing(parameters)}</code>{parameters.easing === 'custom-bezier' && <div className="ml-bezier-fields">{(['bezierX1', 'bezierY1', 'bezierX2', 'bezierY2'] as const).map((key, index) => <label key={key}>{parameterRegistry[key].label}<input type="number" step="0.01" min={index % 2 === 0 ? 0 : undefined} max={index % 2 === 0 ? 1 : undefined} value={parameters[key] ?? [.42, 0, .58, 1][index]} onChange={e => { const value = Number(e.target.value); if (Number.isFinite(value)) onChange(key, index % 2 === 0 ? Math.max(0, Math.min(1, value)) : value); }} /></label>)}</div>}</>}</section>;
}
