import { useEffect, useRef } from 'react';
import type { Parameters } from './presets';
import { contentSwapTokens } from './contentSwap';
import { createPreviewTimeline } from './previewTimeline';
export function ContentSwapPreview({ parameters, enabled, paused, autoplay, replay }: { parameters: Parameters; enabled: boolean; paused: boolean; autoplay: boolean; replay: number }) {
  const root = useRef<HTMLDivElement>(null), action = useRef<() => void>(() => {});
  const clock = useRef<ReturnType<typeof createPreviewTimeline> | null>(null);
  useEffect(() => { clock.current?.setPaused(paused); }, [paused]);
  const signature = JSON.stringify(parameters);
  useEffect(() => {
    const node = root.current!, timeline = createPreviewTimeline(), t = contentSwapTokens(parameters);
    clock.current = timeline; timeline.setPaused(paused);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const layers = Array.from(node.querySelectorAll<HTMLElement>('[data-swap-state]'));
    const cta = node.querySelector<HTMLElement>('[data-swap-cta]')!;
    let state = 0, visible = false, busy = false, timer: number | undefined;
    let animations: Animation[] = [];
    const rest = () => node.querySelectorAll<HTMLElement>('[data-swap-part]').forEach(part => { part.style.opacity = Number(part.dataset.contentState) === state ? '1' : '0'; part.style.transform = 'none'; });
    const stop = () => { timeline.clearTimeout(timer); animations.forEach(a => a.cancel()); animations = []; busy = false; rest(); };
    const animate = (part: HTMLElement, frames: Keyframe[], delay: number, duration = t.duration) => animations.push(timeline.track(part.animate(frames, { delay, duration, easing: t.easing, fill: 'both' })));
    const queue = () => { if (enabled && autoplay && visible && !document.hidden && !media.matches) timer = timeline.setTimeout(swap, 1500); };
    function swap() {
      if (!enabled || timeline.paused || !visible || document.hidden || busy) return;
      stop();
      if (media.matches) { state = 1 - state; rest(); return; }
      busy = true;
      animate(cta, [{ transform: 'scale(1)' }, { transform: 'scale(.96)', offset: .4 }, { transform: 'scale(1)' }], 0, t.press);
      const outgoing = layers[state], incoming = layers[1 - state];
      for (const [layer, entering] of [[outgoing, false], [incoming, true]] as const) {
        const layerIndex = entering ? 1 - state : state;
        const tag = node.querySelector<HTMLElement>(`[data-swap-tag][data-content-state="${layerIndex}"]`)!;
        animate(tag, entering ? [{ opacity: 0, transform: `translateX(${t.distance}px)` }, { opacity: 1, transform: 'translateX(0px)' }] : [{ opacity: 1, transform: 'translateX(0px)' }, { opacity: 0, transform: `translateX(-${t.distance}px)` }], t.tagStart + (entering ? t.duration * .15 : 0));
        layer.querySelectorAll<HTMLElement>('[data-swap-chunk]').forEach((part, index) => animate(part, entering ? [{ opacity: 0, transform: `translateY(${t.distance}px)` }, { opacity: 1, transform: 'translateY(0px)' }] : [{ opacity: 1, transform: 'translateY(0px)' }, { opacity: 0, transform: `translateY(-${t.distance}px)` }], t.headlineStart + index * t.stagger + (entering ? t.duration * .25 : 0)));
        const desc = layer.querySelector<HTMLElement>('[data-swap-desc]')!;
        animate(desc, entering ? [{ opacity: 0, transform: `translateY(${t.distance * .5}px)` }, { opacity: 1, transform: 'translateY(0px)' }] : [{ opacity: 1 }, { opacity: 0 }], entering ? t.descriptionStart : t.headlineStart);
      }
      timer = timeline.setTimeout(() => { state = 1 - state; stop(); queue(); }, t.total);
    }
    action.current = swap; rest();
    const reset = () => { stop(); if (enabled && autoplay && visible && !document.hidden && !media.matches) timer = timeline.setTimeout(swap, 650); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reset(); }); observer.observe(node);
    document.addEventListener('visibilitychange', reset); media.addEventListener('change', reset);
    return () => { stop(); timeline.dispose(); clock.current = null; action.current = () => {}; observer.disconnect(); document.removeEventListener('visibilitychange', reset); media.removeEventListener('change', reset); };
  }, [signature, enabled, autoplay, replay]);
  const copy = [
    { tag: 'Discover', lines: [['Find', 'your'], ['next', 'great'], ['little', 'escape.']], description: 'A new place. A different perspective.' },
    { tag: 'Remember', lines: [['Keep', 'every'], ['journey', 'close'], ['to', 'you.']], description: 'Turn your favorite trips into memories.' },
  ];
  return <div ref={root} className="ml-content-swap" onClick={event => event.stopPropagation()}>
    <div className="ml-swap-tag-shell">{copy.map((item, state) => <span className="ml-swap-tag" data-swap-tag data-swap-part data-content-state={state} key={state}>{item.tag}</span>)}</div>
    {copy.map((item, state) => <div className={`ml-swap-state ml-swap-state-${state}`} data-swap-state key={state} aria-hidden="true"><div className="ml-swap-headline">{item.lines.map((words, row) => <div className="ml-swap-line" key={row}>{words.map((word, column) => <span key={column} data-swap-chunk data-swap-part data-content-state={state}>{word}</span>)}</div>)}</div><span className="ml-swap-description" data-swap-desc data-swap-part data-content-state={state}>{item.description}</span></div>)}
    <span className="ml-swap-cta" data-swap-cta onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); action.current(); }}><span>Continue</span></span>
  </div>;
}
