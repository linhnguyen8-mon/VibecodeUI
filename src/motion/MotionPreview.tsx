import { ContentSwapPreview } from './ContentSwapPreview';
import { AdvancedCardPreview } from './AdvancedCardPreview';
import { SwipePreview } from './SwipePreview';
import { useEffect, useRef, useState } from 'react';
import type { MotionPreset } from './presets';
import type { MotionConfig } from './config';
import { startPreviewPlayback } from './playback';
export function MotionPreview({ preset, config, autoplay = true, replay = 0, paused = false, enabled = true }: { preset: MotionPreset; config: MotionConfig; autoplay?: boolean; replay?: number; paused?: boolean; enabled?: boolean }) {
  const playbackControl = useRef<ReturnType<typeof startPreviewPlayback> | null>(null);
  useEffect(() => { playbackControl.current?.setPaused(paused); }, [paused]);
  const stage = useRef<HTMLDivElement>(null);
  const object = useRef<HTMLDivElement>(null);
  const directExpansion = useRef<Animation[]>([]);
  const directPress = useRef<Animation | null>(null);
  const restart = useRef<() => void>(() => {});
  const [reduced, setReduced] = useState(false);
  const signature = JSON.stringify(config);
  useEffect(() => {
    const container = stage.current;
    const node = object.current;
    if (!container || !node || !enabled) return;
    const playback = startPreviewPlayback(container, node, config, autoplay, setReduced);
    playbackControl.current = playback; playback.setPaused(paused);
    restart.current = playback.replay;
    return () => { directExpansion.current.forEach(animation => animation.cancel()); directExpansion.current = []; directPress.current?.cancel(); directPress.current = null; playback.dispose(); playbackControl.current = null; restart.current = () => {}; };
  }, [preset.id, signature, autoplay, replay, enabled]);
  const track = (animation: Animation) => playbackControl.current?.track(animation) ?? animation;
  const magicPose = (pose: 'hover' | 'press' | 'rest') => {
    if (preset.id !== 'magic-button' || reduced || paused || !enabled) return;
    const depth = config.parameters.depth ?? 4;
    const milliseconds = pose === 'press' ? 34 : pose === 'hover' ? 250 : 600;
    for (const [selector, y] of [['[data-magic-front]', pose === 'press' ? -Math.min(2, depth / 2) : pose === 'hover' ? -(depth + 2) : -depth], ['[data-magic-shadow]', pose === 'press' ? 1 : pose === 'hover' ? 4 : 2]] as const) {
      const layer = object.current?.querySelector<HTMLElement>(selector);
      if (!layer) continue;
      const from = getComputedStyle(layer).transform;
      layer.getAnimations().filter(animation => (animation.effect as KeyframeEffect | null)?.getKeyframes().some(frame => frame.transform !== undefined)).forEach(animation => animation.cancel());
      track(layer.animate([{ transform: from }, { transform: `translateY(${y}px)` }], { duration: milliseconds, easing: pose === 'press' ? 'linear' : pose === 'hover' ? 'cubic-bezier(0.3,0.7,0.4,1.5)' : 'cubic-bezier(0.3,0.7,0.4,1)', fill: 'forwards' }));
    }
  };
  const pressPose = (pressed: boolean) => {
    if (preset.behavior !== 'press' || paused || !enabled || reduced || !object.current) return;
    const node = object.current;
    const from = getComputedStyle(node).transform;
    node.getAnimations().forEach(animation => animation.cancel());
    directPress.current = track(node.animate([{ transform: from }, { transform: pressed ? `scale(${config.parameters.scale ?? .96})` : 'scale(1)' }], {
      duration: pressed ? Math.min(80, config.parameters.duration * .2) : config.parameters.duration,
      easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards',
    }));
  };
  const type = preset.previewType;
  return <div ref={stage} className={`ml-preview ml-scene-${type}${enabled ? '' : ' ml-preview-idle'}`} onPointerEnter={() => { if (enabled && !paused) restart.current(); }} onPointerDown={() => { if (enabled && !paused && preset.behavior === 'depth-press') restart.current(); }} aria-label={`${preset.name} motion preview`}>
    <div className="ml-scene-backdrop" aria-hidden="true"><i /><i /><i /></div>
    {preset.behavior === 'content-swap' ? <ContentSwapPreview parameters={config.parameters} enabled={enabled} paused={paused} autoplay={autoplay} replay={replay} /> : config.advancedCard ? <AdvancedCardPreview config={config.advancedCard} autoplay={autoplay} replay={replay} paused={paused} enabled={enabled} /> : config.swipe ? <SwipePreview tokens={config.swipe} autoplay={autoplay} replay={replay} paused={paused} enabled={enabled} /> : preset.behavior === 'number-roll' ? <div ref={object} className="ml-number-roll" onClick={event => { event.stopPropagation(); if (enabled && !paused) restart.current(); }} aria-hidden="true">{[0, 1, 2, 3].map(index => <div className="ml-digit-mask" data-digit={index} key={index}><span data-digit-old>{'1248'[index]}</span><span data-digit-new>{'1349'[index]}</span></div>)}</div> : preset.behavior === 'text-swap' ? <div ref={object} className="ml-text-swap" onClick={event => { event.stopPropagation(); if (enabled && !paused) restart.current(); }} aria-hidden="true"><span data-text-old /><span data-text-new /></div> : preset.behavior === 'highlight-sweep' ? <div ref={object} className="ml-highlight-demo" onClick={event => { event.stopPropagation(); if (enabled && !paused) restart.current(); }} aria-hidden="true"><div className="ml-highlight-paragraph"><p>Every journey starts with <span className="ml-highlight-phrase" data-highlight style={{ backgroundPosition: config.parameters.sweepDirection === 'left' ? 'right center' : 'left center', backgroundImage: `linear-gradient(rgb(255 229 138 / ${config.parameters.sweepIntensity ?? .7}),rgb(255 229 138 / ${config.parameters.sweepIntensity ?? .7}))` }}>a little curiosity</span>. Explore somewhere new, notice the small details, and keep the moments that matter.</p></div></div> : type === 'content' || type === 'list' ? <div ref={object} className="ml-content-document" aria-hidden="true">
      <span className="ml-content-title ml-content-placeholder" data-motion-part />
      <div className="ml-content-image ml-content-placeholder" data-motion-part />
      {[0, 1].map(index => <section className="ml-content-section" data-motion-part key={index}><span className="ml-content-section-title ml-content-placeholder" /><span className="ml-content-description ml-content-placeholder" /><span className="ml-content-description ml-content-description-short ml-content-placeholder" /></section>)}
    </div> : preset.behavior === 'mobile-modal-expand' ? <div className="ml-mobile-screen" aria-hidden="true">
      <div className="ml-mobile-background"><span /><span /><span /></div>
      <div ref={object} className="ml-mobile-modal" style={{ transformOrigin: config.transformOrigin }}>
        <div className="ml-mobile-modal-header" data-mobile-header><span className="ml-demo-title-bar" /><span className="ml-demo-text-bar" /></div>
        <div className="ml-mobile-modal-fields">{[0, 1, 2].map(index => <div className="ml-mobile-modal-field" data-mobile-field={index} key={index}><span className="ml-demo-text-bar" /><span className="ml-mobile-field-box" /></div>)}</div>
      </div>
    </div> : preset.behavior === 'button-expand'  ? <div ref={object} className="ml-expand-actions" aria-hidden="true" onPointerDown={event => {
      event.stopPropagation();
      const node = object.current;
      if (!node || reduced || paused || !enabled) return;
      directExpansion.current.forEach(animation => animation.cancel());
      directExpansion.current = config.contentTracks.flatMap(track => Array.from(node.querySelectorAll<HTMLElement>(track.selector)).map(layer => {
        layer.getAnimations().forEach(animation => animation.cancel());
        return playbackControl.current!.track(layer.animate(track.frames, { duration: track.duration, delay: Math.max(0, track.delay - 650), easing: track.easing ?? 'ease-out', fill: 'both' }));
      }));
    }}>
      <span className="ml-expand-primary" data-expand-primary><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg></span>
      {[0, 1].map(index => <span key={index} className={`ml-expand-secondary ml-expand-secondary-${index}`} data-expand-secondary={index}><svg viewBox="0 0 24 24" fill="none"><path d={index === 0 ? "M6 5h12v14H6zM9 9h6M9 13h6" : "M5 12h14M13 6l6 6-6 6"} /></svg></span>)}
    </div> : preset.behavior === 'progress-bar-sweep' ? <div ref={object} className="ml-status-progress-demo" aria-hidden="true"><span className="ml-demo-title-bar" /><div className="ml-status-progress-track"><span className="ml-status-progress-fill" data-progress-bar-fill /></div><span className="ml-demo-text-bar" /></div> : preset.behavior === 'progress-sweep'  ? <div ref={object} className="ml-progress-button" aria-hidden="true" onPointerDown={event => { event.stopPropagation(); if (enabled && !paused) restart.current(); }}>
      <span className="ml-button-progress" data-button-progress />
      <span className="ml-button-skeleton-label" data-button-label />
      <svg className="ml-button-check" data-button-check viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div> : preset.id === 'magic-button'  ? <div ref={object} className="ml-magic-root" aria-hidden="true" onPointerEnter={() => magicPose('hover')} onPointerDown={event => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); magicPose('press'); }} onPointerUp={() => magicPose('hover')} onPointerLeave={() => magicPose('rest')} onPointerCancel={() => magicPose('rest')}>
      <span className="ml-magic-shadow ml-magic-rainbow" data-magic-shadow />
      <span className="ml-magic-edge ml-magic-rainbow" data-magic-edge />
      <span className="ml-magic-front" data-magic-front style={{ transform: `translateY(-${config.parameters.depth ?? 4}px)` }}><span className="ml-button-skeleton-label" /></span>
    </div> : type === 'navigation'  ? <div className="ml-nav-window" aria-hidden="true">
      <div className="ml-nav-topbar"><i /><i /><i /></div>
      <div className="ml-nav-content"><span className="ml-demo-title-bar" /><span /><span /><span /></div>
      <div ref={object} style={{ transformOrigin: 'top left' }} className={`ml-nav-sidebar ${preset.behavior === 'sidebar-expand' ? 'ml-nav-modal' : ''}`}>
        <div className="ml-nav-sidebar-content" data-sidebar-content>
          <div className="ml-nav-brand"><i /> <span className="ml-demo-title-bar" /></div>
          {[0, 1, 2].map(index => <div className="ml-nav-row" key={index}><i className="ml-demo-nav-icon" /><span className="ml-demo-text-bar" /></div>)}
        </div>
        {preset.behavior === 'sidebar-expand' && <div className="ml-nav-modal-content">
          <span data-modal-title className="ml-demo-title-bar" />
          <div className="ml-nav-field" data-modal-field="0"><span className="ml-demo-text-bar" /><strong><i className="ml-demo-text-bar" /></strong></div>
          <div className="ml-nav-field" data-modal-field="1"><span className="ml-demo-text-bar" /><strong><i className="ml-demo-text-bar" /></strong></div>
          <div className="ml-nav-field ml-nav-save" data-modal-field="2"><span className="ml-button-skeleton-label" /></div>
        </div>}
      </div>
    </div> : type === 'toggle' ? <div className="ml-toggle-track" style={{ width: (config.parameters.distance ?? 24) + 30 }}><div ref={object} className="ml-toggle-knob" /></div> : type === 'skeleton' ? <div className="ml-skeleton"><span /><span /><span /><div ref={object} className="ml-shimmer" /></div> : <div ref={object} style={{ transformOrigin: config.transformOrigin }} className={`ml-object ml-object-${type}${preset.behavior === 'depth-press' ? ` ml-button-raised${preset.id === 'magic-button' ? ' ml-button-magic' : ''}` : ''}`} aria-hidden="true" onPointerDown={event => { if (preset.behavior === 'press') { event.currentTarget.setPointerCapture(event.pointerId); pressPose(true); } }} onPointerUp={() => pressPose(false)} onPointerCancel={() => pressPose(false)} onLostPointerCapture={() => pressPose(false)}>
      {type === 'button'  ? <>{preset.id === 'magic-button' && <span className="ml-gradient-edge" data-gradient-edge />}<span className="ml-button-skeleton-label" /></> : type === 'badge' ? <span className="ml-demo-text-bar" /> : type === 'status' ? <><i /><span className="ml-demo-text-bar" /></> : type === 'progress' ? null : type === 'input' ? <span className="ml-demo-text-bar" /> : <><span className="ml-demo-avatar" /><span className="ml-demo-title-bar" /><span className="ml-object-line" /><span className="ml-object-line short" /></>}

    </div>}
    {['stack-fan-swipe', 'swipe-dismiss', 'stack-card-cycle', 'horizontal-card-focus', 'vertical-card-compress'].includes(preset.behavior) && <span className="ml-swipable-tag">Swipable</span>}
    {reduced && <small className="ml-reduced">Reduced motion</small>}
  </div>;
}
