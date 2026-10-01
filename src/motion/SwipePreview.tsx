import { createPreviewTimeline } from './previewTimeline';
import { useEffect, useRef } from 'react';
import { swipePose, swipeTarget, type SwipeTokens } from './swipe';
export function SwipePreview({ tokens, autoplay, replay, paused = false, enabled = true }: { tokens: SwipeTokens; autoplay: boolean; replay: number; paused?: boolean; enabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const controller = useRef<{ down: (event: React.PointerEvent) => void; move: (event: React.PointerEvent) => void; up: (cancel: boolean) => void } | null>(null);
  const clock = useRef<ReturnType<typeof createPreviewTimeline> | null>(null);
  useEffect(() => { clock.current?.setPaused(paused); }, [paused]);
  const signature = JSON.stringify(tokens);
  useEffect(() => {
    const timeline = createPreviewTimeline(); clock.current = timeline; timeline.setPaused(paused);
    const node = root.current!;
    const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-swipe-card]'));
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, dragging = false, index = 0, offset = 0, compression = 0, start = 0, frame = 0;
    let timer: number;
    const stride = () => (tokens.vertical ? node.clientHeight : node.clientWidth) - tokens.peek * 2;
    const render = () => {
      cards.forEach((card, i) => {
        const pose = swipePose(i - 1, offset, stride(), tokens, compression);
        card.style.transform = `translate(${tokens.vertical ? '-50%' : `calc(-50% + ${pose.position}px)`}, ${tokens.vertical ? `calc(-50% + ${pose.position}px)` : '-50%'}) scale(${pose.scale})`;
        card.style.opacity = String(pose.opacity); card.style.zIndex = String(pose.zIndex);
        card.dataset.tone = String((index + i + 6) % 3);
      });
    };
    const stop = () => { timeline.cancelAnimationFrame(frame); timeline.clearTimeout(timer); };
    const ready = () => enabled && visible && !document.hidden && !media.matches;
    const queue = () => { if (autoplay && ready()) timer = timeline.setTimeout(demo, 1400); };
    const settle = (target: number) => {
      const from = offset, compressed = compression, begun = timeline.now();
      const tick = (now: number) => {
        if (!ready()) return;
        const fraction = Math.min(1, (now - begun) / tokens.duration);
        const time = fraction * 10 * tokens.strength;
        const end = 1 - Math.exp(-10 * tokens.strength) * (1 + 10 * tokens.strength);
        const progress = fraction === 1 ? 1 : (1 - Math.exp(-time) * (1 + time)) / end;
        offset = from + (-target * stride() - from) * progress;
        compression = compressed * (1 - progress); render();
        if (fraction < 1) frame = timeline.requestAnimationFrame(tick);
        else { index += target; offset = 0; compression = 0; render(); queue(); }
      };
      frame = timeline.requestAnimationFrame(tick);
    };
    function demo() {
      stop(); if (!ready() || dragging) return;
      const begun = timeline.now();
      const sign = tokens.direction === 'forward' ? -1 : 1;
      const tick = (now: number) => {
        if (!ready()) return;
        const progress = Math.min(1, (now - begun) / 500);
        offset = sign * stride() * .65 * progress;
        compression = Math.min(1, Math.abs(offset) / (stride() * .5)); render();
        if (progress < 1) frame = timeline.requestAnimationFrame(tick); else settle(sign < 0 ? 1 : -1);
      };
      frame = timeline.requestAnimationFrame(tick);
    }
    controller.current = {
      down(event) { if (timeline.paused || !enabled) return; stop(); if (media.matches) return; dragging = true; start = (tokens.vertical ? event.clientY : event.clientX) - offset; node.setPointerCapture(event.pointerId); },
      move(event) { if (!dragging || timeline.paused) return; offset = Math.max(-stride(), Math.min(stride(), (tokens.vertical ? event.clientY : event.clientX) - start)); compression = Math.min(1, Math.abs(offset) / (stride() * .5)); render(); },
      up(cancel) { if (!dragging || timeline.paused) return; dragging = false; settle(cancel ? 0 : swipeTarget(offset, stride())); },
    };
    const reset = () => { stop(); dragging = false; offset = 0; compression = 0; render(); if (autoplay && ready()) timer = timeline.setTimeout(demo, 650); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reset(); });
    observer.observe(node);
    const resize = new ResizeObserver(render); resize.observe(node);
    media.addEventListener('change', reset); document.addEventListener('visibilitychange', reset); render();
    return () => { stop(); timeline.dispose(); clock.current = null; observer.disconnect(); resize.disconnect(); media.removeEventListener('change', reset); document.removeEventListener('visibilitychange', reset); controller.current = null; };
  }, [signature, autoplay, replay, enabled]);
  return <div ref={root} className={`ml-swipe-scene ${tokens.vertical ? 'ml-swipe-vertical' : ''}`} style={{ '--swipe-peek': `${tokens.peek}px` } as React.CSSProperties} aria-label={tokens.vertical ? 'Vertical card drag preview' : 'Horizontal card drag preview'} onClick={event => event.stopPropagation()} onPointerDown={event => { event.stopPropagation(); controller.current?.down(event); }} onPointerMove={event => controller.current?.move(event)} onPointerUp={() => controller.current?.up(false)} onPointerCancel={() => controller.current?.up(true)} onLostPointerCapture={() => controller.current?.up(true)}>
    {[0, 1, 2].map(i => <div className="ml-swipe-card" data-swipe-card key={i} aria-hidden="true"><span className="ml-swipe-image" /><span className="ml-demo-title-bar" /><span className="ml-demo-text-bar" /><span className="ml-demo-text-bar" /></div>)}
  </div>;
}
