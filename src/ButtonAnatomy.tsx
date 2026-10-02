import { inspectionColor } from './lib/inspectionColor';
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { semanticSpacingColors } from './lib/spacing';
import { GalleryButton } from './GalleryButton';
import type { DesignSystem } from './types';
import { getButtonSize } from './lib/button';
import { referenceName } from './lib/tokenGraph';
import './button-anatomy.css';

type Box = { x: number; y: number; width: number; height: number };
type Measurement = { button: Box; icon: Box; label: Box; css: Record<string, string> };
const number = (value: number) => `${Math.round(value * 10) / 10}px`;

export function ButtonAnatomy({ ds }: { ds: DesignSystem }) {
  const stage = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [measurement, setMeasurement] = useState<Measurement>();
  const [active, setActive] = useState('');
  const size = 'M';
  const variant: string = 'primary';
  const disabled = false;
  const anatomy = true;
  const spacing = true;
  const metrics = getButtonSize(ds, size);
  const magnification = 2;
  const elevo = ds.id === 'ds-learning-bright';
  const style = Object.fromEntries(Object.entries({ height: metrics.height, 'font-size': metrics.fontSize, 'font-weight': metrics.fontWeight, 'padding-x': metrics.paddingX, 'padding-y': metrics.paddingY, 'icon-padding-left': metrics.iconPaddingLeft, 'icon-padding-right': metrics.iconPaddingRight, 'icon-gap': metrics.iconGap, 'icon-size': metrics.iconSize }).map(([key, value]) => [`--button-${key}`, key === 'font-weight' ? String(value) : `${value}px`])) as CSSProperties;
  useLayoutEffect(() => {
    let mounted = true;
    const measure = () => {
      if (!mounted || !stage.current || !button.current || !label.current) return;
      const origin = stage.current.getBoundingClientRect();
      const box = (element: Element): Box => { const rect = element.getBoundingClientRect(); return { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height }; };
      const computed = getComputedStyle(button.current);
      const css = Object.fromEntries(['paddingLeft','paddingRight','paddingTop','paddingBottom','gap','borderRadius','borderTopWidth','borderTopColor','backgroundColor','color','fontFamily','fontSize','fontWeight','lineHeight','boxShadow'].map(key => [key, computed[key as keyof CSSStyleDeclaration] as string]));
      setMeasurement({ button: box(button.current), icon: box(button.current.querySelector('svg')!), label: box(label.current), css });
    };
    measure();
    const observer = new ResizeObserver(measure);
    [stage.current, button.current, label.current, button.current?.querySelector('svg')].forEach(element => { if (element) observer.observe(element); });
    void document.fonts.ready.then(measure);
    return () => { mounted = false; observer.disconnect(); };
  }, [ds, size, variant, disabled]);
  const source = (name: string) => {
    const token = ds.tokens.find(candidate => candidate.name === name);
    if (!token) return `${name} · renderer fallback`;
    const ref = referenceName(token.override ?? token.value);
    return ref ? `${name} → ${ref}` : name;
  };
  const finalTokens = (description: string) => {
    const names = description.match(/(?:foundation|color|spacing|radius|shadow)\.[A-Za-z0-9_.-]+/g) ?? [];
    const terminal = (name: string, visited = new Set<string>()): string | undefined => {
      const token = ds.tokens.find(candidate => candidate.name === name);
      if (!token || visited.has(name)) return undefined;
      visited.add(name);
      const reference = referenceName(token.override ?? token.value);
      return reference ? terminal(reference, visited) : name;
    };
    return [...new Set(names.map(name => terminal(name)).filter(Boolean))].join(' · ') || 'Implementation';
  };
  const m = measurement;
  const rows: { part: string; property: string; value: string; source: string; key: string }[] = m ? [
    { part: '1 Container', property: 'Width', value: `${number(m.button.width / magnification)} · auto`, source: 'Rendered content + padding + gap + border', key: 'width' },
    { part: '1 Container', property: 'Height', value: `${number(m.button.height / magnification)} · min ${metrics.height}px`, source: source(`foundation.buttonSizes.${size}.height`), key: 'height' },
    { part: '1 Container', property: 'Padding', value: `T ${m.css.paddingTop} · R ${m.css.paddingRight} · B ${m.css.paddingBottom} · L ${m.css.paddingLeft}`, source: `T/B: ${source(`foundation.buttonSizes.${size}.paddingY`)} | L: ${source(`foundation.buttonSizes.${size}.iconPaddingLeft`)} | R: ${source(`foundation.buttonSizes.${size}.iconPaddingRight`)}`, key: 'padding' },
    { part: '1 Container', property: 'Radius', value: m.css.borderRadius, source: source(elevo ? 'radius.button' : 'radius.control'), key: 'radius' },
    { part: '1 Container', property: 'Border', value: `${m.css.borderTopWidth} ${inspectionColor(m.css.borderTopColor)}`, source: variant === 'outline' ? `${source('color.border.default')} · implementation: min 1px` : elevo ? 'Implementation: Elevo 1.5px transparent' : `${source('foundation.border.enabled')} + ${source('foundation.border.width')} · transparent`, key: 'border' },
    { part: '1 Container', property: 'Background', value: inspectionColor(m.css.backgroundColor), source: disabled ? 'Implementation: disabled variant color mixing' : source(variant === 'primary' ? 'color.interactive.default' : variant === 'secondary' ? 'color.brand.secondary' : 'color.surface.default'), key: 'background' },
    { part: '1 Container', property: 'Elevation', value: m.css.boxShadow, source: elevo && variant === 'primary' ? source('shadow.button.primary') : 'Implementation: variant renderer', key: 'elevation' },
    { part: '2 Icon', property: 'Size', value: `${number(m.icon.width / magnification)} × ${number(m.icon.height / magnification)}`, source: source(`foundation.buttonSizes.${size}.iconSize`), key: 'icon' },
    { part: '2 Icon', property: 'Gap to label', value: m.css.gap, source: source(`foundation.buttonSizes.${size}.iconGap`), key: 'gap' },
    { part: '2 Icon', property: 'Color', value: inspectionColor(m.css.color), source: disabled ? 'Implementation: disabled variant color mixing' : source(variant === 'outline' ? elevo ? 'color.text.primary' : 'color.brand.primary' : 'color.text.on-color'), key: 'iconColor' },
    { part: '3 Label', property: 'Typography', value: `Size ${m.css.fontSize} · Weight ${m.css.fontWeight} · Line height ${m.css.lineHeight}`, source: `Size: ${source(`foundation.buttonSizes.${size}.fontSize`)} | Weight: ${source(`foundation.buttonSizes.${size}.fontWeight`)} | Line height: Implementation (1.3 × font size)`, key: 'typography' },
    { part: '3 Label', property: 'Color', value: inspectionColor(m.css.color), source: source('color.text.on-color'), key: 'color' },
  ] : [];
  const focusedPart = rows.find(row => row.key === active)?.part;
  const pill = (x: number, y: number, text: string, color: string) => <g className="inspection-pill"><rect x={x - 27} y={y - 13} width={54} height={26} rx={13} fill={color}/><text x={x} y={y + 4} textAnchor="middle">{text}</text></g>;
  const ruler = (key: string, x1: number, y1: number, x2: number, y2: number, text: string, color: string, labelX: number, labelY: number) => <g key={`ruler-${key}-${x1}-${y1}`} className={active === key || active === 'padding' && key.startsWith('padding') ? 'inspection-ruler is-active' : 'inspection-ruler'} style={{ color }}><path d={`M${x1},${y1} L${x2},${y2} M${x1 - (x1 === x2 ? 5 : 0)},${y1 - (y1 === y2 ? 5 : 0)} L${x1 + (x1 === x2 ? 5 : 0)},${y1 + (y1 === y2 ? 5 : 0)} M${x2 - (x1 === x2 ? 5 : 0)},${y2 - (y1 === y2 ? 5 : 0)} L${x2 + (x1 === x2 ? 5 : 0)},${y2 + (y1 === y2 ? 5 : 0)}`} />{pill(labelX,labelY,text,color)}</g>;
  const zone = (key: string, x: number, y: number, width: number, height: number, color: string) => <rect key={`zone-${key}`} className={`inspection-zone ${active === key || active === 'padding' && key.startsWith('padding') ? 'is-active' : ''}`} x={x} y={y} width={Math.max(0,width)} height={Math.max(0,height)} style={{ color }} />;
  return <section className="button-anatomy" style={style} aria-label="Button anatomy">
    <header><h3>Button</h3><span>{variant} · {size}</span></header>
    <div className="button-inspection-legend"><span style={{ color: semanticSpacingColors.containerPadding }}>Padding</span><span style={{ color: semanticSpacingColors.elementGap }}>Gap</span><span style={{ color: semanticSpacingColors.pageMargin }}>Icon</span><span style={{ color: semanticSpacingColors.sectionGap }}>Radius</span><small>View ×2 · values in actual px</small></div>
    <div className="button-anatomy-stage" ref={stage}>
      <span className="button-anatomy-specimen"><GalleryButton ref={button} variant={variant} disabled={disabled}><ArrowRight aria-hidden="true" /><span ref={label}>Continue</span></GalleryButton></span>
      {m && <svg className="button-anatomy-measures" aria-hidden="true">
        {spacing && <>
          {zone('paddingLeft',m.button.x,m.button.y,m.icon.x-m.button.x,m.button.height,semanticSpacingColors.containerPadding)}
          {zone('paddingRight',m.label.x+m.label.width,m.button.y,m.button.x+m.button.width-m.label.x-m.label.width,m.button.height,semanticSpacingColors.containerPadding)}
          {zone('paddingTop',m.icon.x,m.button.y,m.label.x+m.label.width-m.icon.x,parseFloat(m.css.paddingTop)*magnification,semanticSpacingColors.containerPadding)}
          {zone('paddingBottom',m.icon.x,m.button.y+m.button.height-parseFloat(m.css.paddingBottom)*magnification,m.label.x+m.label.width-m.icon.x,parseFloat(m.css.paddingBottom)*magnification,semanticSpacingColors.containerPadding)}
          {zone('gap',m.icon.x+m.icon.width,m.button.y-16,m.label.x-m.icon.x-m.icon.width,m.button.height+32,semanticSpacingColors.elementGap)}
          {zone('icon',m.icon.x,m.icon.y,m.icon.width,m.icon.height,semanticSpacingColors.pageMargin)}
          {ruler('width',m.button.x,m.button.y-65,m.button.x+m.button.width,m.button.y-65,number(m.button.width/magnification), '#64748b',m.button.x+m.button.width/2,m.button.y-84)}
          {ruler('height',m.button.x+m.button.width+44,m.button.y,m.button.x+m.button.width+44,m.button.y+m.button.height,number(m.button.height/magnification),'#64748b',m.button.x+m.button.width+78,m.button.y+m.button.height/2)}
          {ruler('paddingLeft',m.button.x,m.button.y+m.button.height+30,m.icon.x,m.button.y+m.button.height+30,m.css.paddingLeft,semanticSpacingColors.containerPadding,m.button.x,m.button.y+m.button.height+55)}
          {ruler('paddingRight',m.label.x+m.label.width,m.button.y+m.button.height+30,m.button.x+m.button.width,m.button.y+m.button.height+30,m.css.paddingRight,semanticSpacingColors.containerPadding,m.button.x+m.button.width,m.button.y+m.button.height+55)}
          {ruler('paddingTop',m.button.x-24,m.button.y,m.button.x-24,m.button.y+parseFloat(m.css.paddingTop)*magnification,m.css.paddingTop,semanticSpacingColors.containerPadding,m.button.x-65,m.button.y+4)}
          {ruler('paddingBottom',m.button.x-24,m.button.y+m.button.height-parseFloat(m.css.paddingBottom)*magnification,m.button.x-24,m.button.y+m.button.height,m.css.paddingBottom,semanticSpacingColors.containerPadding,m.button.x-65,m.button.y+m.button.height-4)}
          {ruler('gap',m.icon.x+m.icon.width,m.button.y+m.button.height+78,m.label.x,m.button.y+m.button.height+78,m.css.gap,semanticSpacingColors.elementGap,(m.icon.x+m.icon.width+m.label.x)/2,m.button.y+m.button.height+101)}
          {ruler('icon',m.icon.x,m.icon.y-24,m.icon.x+m.icon.width,m.icon.y-24,number(m.icon.width/magnification),semanticSpacingColors.pageMargin,m.icon.x+m.icon.width/2,m.icon.y-43)}
          <g className="inspection-radius" style={{ color:semanticSpacingColors.sectionGap }}><path d={`M${m.button.x+m.button.width-20},${m.button.y-8} Q${m.button.x+m.button.width+8},${m.button.y-8} ${m.button.x+m.button.width+8},${m.button.y+20} M${m.button.x+m.button.width+4},${m.button.y-4} L${m.button.x+m.button.width+39},${m.button.y-40}`}/>{pill(m.button.x+m.button.width+56,m.button.y-49,m.css.borderRadius,semanticSpacingColors.sectionGap)}</g>
        </>}
        {anatomy && (['button','icon','label'] as const).map((part, index) => { const box = m[part]; return <g key={part}><rect className={focusedPart?.startsWith(String(index + 1)) ? 'part-active' : 'part-outline'} x={box.x - 3} y={box.y - 3} width={box.width + 6} height={box.height + 6} rx={3}/><text className="anatomy-marker" x={box.x + box.width / 2} y={index === 0 ? m.button.y - 48 : m.button.y + m.button.height + 18}>{index + 1}</text></g>; })}
      </svg>}
    </div>
    <div className="button-anatomy-table"><table aria-label="Button anatomy, dimensions and tokens"><thead><tr><th>Thành phần</th><th>Thuộc tính</th><th>Dimension / Value</th><th>Token</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.key} tabIndex={0} onMouseEnter={() => setActive(row.key)} onMouseLeave={() => setActive('')} onFocus={() => setActive(row.key)} onBlur={() => setActive('')} className={active === row.key ? 'is-active' : ''}><th scope="row">{index === 0 || rows[index - 1].part !== row.part ? row.part : ''}</th><td>{row.property}</td><td>{row.value}</td><td><code title={row.source}>{finalTokens(row.source)}</code></td></tr>)}</tbody></table></div>
  </section>;
}
