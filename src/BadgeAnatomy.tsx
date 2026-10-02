import { inspectionColor } from './lib/inspectionColor';
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { DesignSystem } from './types';
import { getBadge } from './lib/badge';
import { referenceName } from './lib/tokenGraph';
import { semanticSpacingColors } from './lib/spacing';
import { GalleryBadge } from './GalleryBadge';
import './button-anatomy.css';

type Box = { x: number; y: number; width: number; height: number };
const px = (value: number) => `${Math.round(value * 10) / 10}px`;
export function BadgeAnatomy({ ds }: { ds: DesignSystem }) {
  const stage = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [measured, setMeasured] = useState<{ container: Box; label: Box; css: Record<string,string> }>();
  const [active, setActive] = useState('');
  const metrics = getBadge(ds);
  const zoom = 2;
  const style = { '--badge-height': `${metrics.height}px`, '--badge-padding-x': `${metrics.paddingX}px`, '--badge-radius': `${metrics.radius}px`, '--badge-font-size': `${metrics.fontSize}px` } as CSSProperties;
  useLayoutEffect(() => {
    let mounted = true;
    const measure = () => {
      if (!mounted || !stage.current || !badge.current || !label.current) return;
      const origin = stage.current.getBoundingClientRect();
      const bounds = (element: Element): Box => { const rect = element.getBoundingClientRect(); return { x: rect.left-origin.left, y: rect.top-origin.top, width: rect.width, height: rect.height }; };
      const computed = getComputedStyle(badge.current);
      const css = Object.fromEntries(['paddingLeft','paddingRight','paddingTop','paddingBottom','borderRadius','borderTopWidth','borderTopColor','backgroundColor','color','fontFamily','fontSize','fontWeight','lineHeight','boxShadow'].map(key => [key,computed[key as keyof CSSStyleDeclaration] as string]));
      setMeasured({ container: bounds(badge.current), label: bounds(label.current), css });
    };
    measure();
    const observer = new ResizeObserver(measure);
    [stage.current,badge.current,label.current].forEach(element => { if(element) observer.observe(element); });
    void document.fonts.ready.then(measure);
    return () => { mounted=false; observer.disconnect(); };
  },[ds]);
  const source = (name: string): string => {
    const visited = new Set<string>();
    let current: string | undefined = name;
    while(current && !visited.has(current)) {
      visited.add(current);
      const token = ds.tokens.find(candidate => candidate.name === current);
      if(!token) return 'Implementation';
      const reference = referenceName(token.override ?? token.value);
      if(!reference) return current;
      current=reference;
    }
    return 'Implementation';
  };
  const m = measured;
  const rows = m ? [
    { part:'1 Container', key:'width', property:'Width', value:`${px(m.container.width/zoom)} · auto`, token:'Implementation', detail:'Rendered label + padding' },
    { part:'1 Container', key:'height', property:'Height', value:`${px(m.container.height/zoom)} · min ${metrics.height}px`, token:source('foundation.badge.height'), detail:'foundation.badge.height' },
    { part:'1 Container', key:'padding', property:'Padding', value:`T ${m.css.paddingTop} · R ${m.css.paddingRight} · B ${m.css.paddingBottom} · L ${m.css.paddingLeft}`, token:`T/B: ${source('spacing.XS')} · L/R: ${source('foundation.badge.paddingX')}`, detail:'Vertical: spacing.XS; horizontal: foundation.badge.paddingX. Remaining vertical space comes from min-height and centered alignment.' },
    { part:'1 Container', key:'radius', property:'Radius', value:m.css.borderRadius, token:source('foundation.badge.radius'), detail:'foundation.badge.radius' },
    { part:'1 Container', key:'background', property:'Background', value:inspectionColor(m.css.backgroundColor), token:source('color.interactive.default'), detail:'color.interactive.default' },
    { part:'1 Container', key:'border', property:'Border', value:`${m.css.borderTopWidth} ${inspectionColor(m.css.borderTopColor)}`, token:'Implementation', detail:'Default badge has no border' },
    { part:'1 Container', key:'elevation', property:'Elevation', value:m.css.boxShadow, token:'Implementation', detail:'Default badge has no shadow' },
    { part:'2 Label', key:'typography', property:'Typography', value:`Size ${m.css.fontSize} · Weight ${m.css.fontWeight} · Line height ${m.css.lineHeight}`, token:`${source('foundation.badge.fontSize')} · Implementation`, detail:'Size: foundation.badge.fontSize; weight: implementation 500; line height: implementation 1 × font size' },
    { part:'2 Label', key:'color', property:'Color', value:inspectionColor(m.css.color), token:source('color.text.on-color'), detail:'color.text.on-color' },
  ] : [];
  const pad = semanticSpacingColors.containerPadding;
  const radius = semanticSpacingColors.sectionGap;
  const chip = (x:number,y:number,text:string,color:string) => <g className="inspection-pill"><rect x={x-27} y={y-13} width={54} height={26} rx={13} fill={color}/><text x={x} y={y+4} textAnchor="middle">{text}</text></g>;
  const ruler = (key:string,x1:number,y1:number,x2:number,y2:number,text:string,color:string,x:number,y:number) => <g key={`ruler-${key}-${x1}-${y1}`} className={`inspection-ruler ${active===key ? 'is-active' : ''}`} style={{color}}><path d={`M${x1},${y1} L${x2},${y2} M${x1-(x1===x2?5:0)},${y1-(y1===y2?5:0)} L${x1+(x1===x2?5:0)},${y1+(y1===y2?5:0)} M${x2-(x1===x2?5:0)},${y2-(y1===y2?5:0)} L${x2+(x1===x2?5:0)},${y2+(y1===y2?5:0)}`}/>{chip(x,y,text,color)}</g>;
  const zone = (key:string,x:number,y:number,width:number,height:number) => <rect key={`zone-${key}`} className={`inspection-zone ${active==='padding'?'is-active':''}`} x={x} y={y} width={Math.max(0,width)} height={Math.max(0,height)} style={{color:pad}}/>;
  return <section className="button-anatomy badge-anatomy" style={style} aria-label="Badge anatomy">
    <header><h3>Badge</h3><span>Default</span></header>
    <div className="button-inspection-legend"><span style={{color:pad}}>Padding</span><span style={{color:radius}}>Radius</span><small>View ×2 · values in actual px</small></div>
    <div className="button-anatomy-stage" ref={stage}><span className="button-anatomy-specimen"><GalleryBadge ref={badge}><span ref={label}>Default</span></GalleryBadge></span>
      {m && <svg className="button-anatomy-measures" aria-hidden="true">
        {zone('left',m.container.x,m.container.y,parseFloat(m.css.paddingLeft)*zoom,m.container.height)}
        {zone('right',m.container.x+m.container.width-parseFloat(m.css.paddingRight)*zoom,m.container.y,parseFloat(m.css.paddingRight)*zoom,m.container.height)}
        {zone('top',m.label.x,m.container.y,m.label.width,parseFloat(m.css.paddingTop)*zoom)}
        {zone('bottom',m.label.x,m.container.y+m.container.height-parseFloat(m.css.paddingBottom)*zoom,m.label.width,parseFloat(m.css.paddingBottom)*zoom)}
        {ruler('width',m.container.x,m.container.y-55,m.container.x+m.container.width,m.container.y-55,px(m.container.width/zoom),'#64748b',m.container.x+m.container.width/2,m.container.y-76)}
        {ruler('height',m.container.x+m.container.width+35,m.container.y,m.container.x+m.container.width+35,m.container.y+m.container.height,px(m.container.height/zoom),'#64748b',m.container.x+m.container.width+72,m.container.y+m.container.height/2)}
        {ruler('padding',m.container.x,m.container.y+m.container.height+25,m.label.x,m.container.y+m.container.height+25,m.css.paddingLeft,pad,m.container.x,m.container.y+m.container.height+51)}
        {ruler('padding',m.label.x+m.label.width,m.container.y+m.container.height+25,m.container.x+m.container.width,m.container.y+m.container.height+25,m.css.paddingRight,pad,m.container.x+m.container.width,m.container.y+m.container.height+51)}
        {ruler('padding',m.container.x-20,m.container.y,m.container.x-20,m.container.y+parseFloat(m.css.paddingTop)*zoom,m.css.paddingTop,pad,m.container.x-56,m.container.y-3)}
        {ruler('padding',m.container.x-20,m.container.y+m.container.height-parseFloat(m.css.paddingBottom)*zoom,m.container.x-20,m.container.y+m.container.height,m.css.paddingBottom,pad,m.container.x-56,m.container.y+m.container.height+3)}
        <g className="inspection-radius" style={{color:radius}}><path d={`M${m.container.x+m.container.width-12},${m.container.y-6} Q${m.container.x+m.container.width+6},${m.container.y-6} ${m.container.x+m.container.width+6},${m.container.y+12} M${m.container.x+m.container.width+4},${m.container.y-4} L${m.container.x+m.container.width+32},${m.container.y-32}`}/>{chip(m.container.x+m.container.width+48,m.container.y-45,m.css.borderRadius,radius)}</g>
        {([m.container,m.label]).map((box,index) => <g key={index}><rect className={rows.find(row=>row.key===active)?.part.startsWith(String(index+1))?'part-active':'part-outline'} x={box.x-3} y={box.y-3} width={box.width+6} height={box.height+6} rx={3}/><text className="anatomy-marker" x={box.x+box.width/2} y={index===0?m.container.y-34:m.container.y+m.container.height+16}>{index+1}</text></g>)}
      </svg>}
    </div>
    <div className="button-anatomy-table"><table><caption>Anatomy · Dimensions · Tokens</caption><thead><tr><th>Thành phần</th><th>Thuộc tính</th><th>Dimension / Value</th><th>Token</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.key} tabIndex={0} onMouseEnter={()=>setActive(row.key)} onMouseLeave={()=>setActive('')} onFocus={()=>setActive(row.key)} onBlur={()=>setActive('')} className={active===row.key?'is-active':''}><th scope="row">{index===0||rows[index-1].part!==row.part?row.part:''}</th><td>{row.property}</td><td>{row.value}</td><td><code title={row.detail}>{row.token}</code></td></tr>)}</tbody></table></div>
  </section>;
}
