import { createPreviewTimeline } from './previewTimeline';
import { useEffect, useRef } from 'react';
import { cardEasing, dismissDecision, stackPose, stackTransform, fanPose, flipFrames, type AdvancedCardConfig } from './cardMotion';
export function AdvancedCardPreview({ config: t, autoplay, replay, paused = false, enabled = true }: { config: AdvancedCardConfig; autoplay: boolean; replay: number; paused?: boolean; enabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const events = useRef<{ down: (event: React.PointerEvent) => void; move: (event: React.PointerEvent) => void; up: (cancel: boolean) => void; click: () => void } | null>(null);
  const clock = useRef<ReturnType<typeof createPreviewTimeline> | null>(null);
  useEffect(() => { clock.current?.setPaused(paused); }, [paused]);
  const signature = JSON.stringify(t);
  useEffect(() => {
    const timeline = createPreviewTimeline(); clock.current = timeline; timeline.setPaused(paused);
    const node = root.current!;
    const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-advanced-card]'));
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, dragging = false, back = false, x = 0, y = 0, sx = 0, sy = 0, lastX = 0, lastY = 0, lastTime = 0, velocity = 0, raf = 0, generation = 0;
    let suppressClick = false;
    let timer: number, animations: Animation[] = [];
    const ready = () => enabled && visible && !document.hidden;
    const stop = () => { generation++; timeline.cancelAnimationFrame(raf); timeline.clearTimeout(timer); animations.forEach(a => a.cancel()); animations = [];
      if (t.kind === 'stack-fan-swipe') cards.forEach(card => card.querySelectorAll<HTMLElement>('.ml-demo-title-bar, .ml-demo-text-bar').forEach(part => { part.style.opacity = '0'; part.style.transform = 'none'; }));
    };
    const render = () => {
      if (t.kind === 'stack-card-cycle') {
        const progress = dragging ? Math.min(1, Math.abs(x) / Math.max(1, node.clientWidth * .35)) : 0;
        cards.forEach((card, i) => {
          const pose = stackPose(i, t), target = stackPose(Math.max(0, i - 1), t);
          card.style.transform = i === 0 && dragging
            ? `translate(calc(-50% + ${x}px), -50%) rotate(${Math.sign(x) * progress * 12}deg) scale(${1 - (1 - t.inactiveScale) * progress})`
            : `translate(calc(-50% + ${pose.x + (target.x - pose.x) * progress}px), calc(-50% + ${pose.y + (target.y - pose.y) * progress}px)) rotate(${pose.rotation + (target.rotation - pose.rotation) * progress}deg) scale(${pose.scale + (target.scale - pose.scale) * progress})`;
          card.style.zIndex = String(pose.layer);
        });
      }
      if (t.kind === 'stack-fan-swipe') cards.forEach((card, i) => {
        const pose = fanPose(i - 2 + x / t.fanSpread, t);
        const fullFan = !!node.closest('.ml-detail');
        const poses = cards.map((_, index) => fanPose(index - 2 + x / t.fanSpread, t));
        const bounds = poses.map(p => {
          const radians = p.rotation * Math.PI / 180;
          const halfWidth = (Math.abs(Math.cos(radians)) * card.offsetWidth + Math.abs(Math.sin(radians)) * card.offsetHeight) * p.scale / 2;
          const halfHeight = (Math.abs(Math.sin(radians)) * card.offsetWidth + Math.abs(Math.cos(radians)) * card.offsetHeight) * p.scale / 2;
          return { left: p.x - halfWidth, right: p.x + halfWidth, top: p.y - halfHeight, bottom: p.y + halfHeight };
        });
        const left = Math.min(...bounds.map(b => b.left)), right = Math.max(...bounds.map(b => b.right));
        const top = Math.min(...bounds.map(b => b.top)), bottom = Math.max(...bounds.map(b => b.bottom));
        const fit = fullFan ? Math.min(1, (node.clientWidth - 24) / Math.max(1, right - left), (node.clientHeight - 24) / Math.max(1, bottom - top)) : 1;
        const px = fullFan ? (pose.x - (left + right) / 2) * fit : pose.x;
        const py = fullFan ? (pose.y - (top + bottom) / 2) * fit : pose.y;
        card.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) rotate(${pose.rotation}deg) scale(${pose.scale * fit})`;
        card.style.zIndex = String(pose.layer);

      });
      if (t.kind === 'swipe-dismiss') cards.forEach((card, i) => {
        const ratio = Math.min(1, Math.hypot(x, y) / Math.max(1, node.clientWidth * t.threshold));
        card.style.zIndex = String(5 - i);
        card.style.transform = i === 0 ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${x / node.clientWidth * t.rotationIntensity}deg)` : `translate(-50%, calc(-50% + ${(1 - ratio) * i * 7}px)) scale(${1 - .04 * i * (1 - ratio)})`;
        card.style.opacity = i === 0 ? String(1 - .12 * Math.max(0, (ratio - .75) / .25)) : '1';
      });
    };
    const revealFanContent = () => {
      if (t.kind !== 'stack-fan-swipe' || !ready() || media.matches) return;
      const parts = cards[2].querySelectorAll<HTMLElement>('.ml-demo-title-bar, .ml-demo-text-bar');
      parts.forEach((part, index) => {
        part.getAnimations().forEach(animation => animation.cancel());
        part.style.opacity = '0';
        animations.push(timeline.track(part.animate([{ opacity: 0, transform: `translateX(${t.listReveal.distanceX}px)` }, { opacity: 1, transform: 'translateX(0px)' }], { duration: t.listReveal.duration, delay: 120 + index * t.listReveal.stagger, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'both' })));
      });
    };
    const schedule = () => { if (autoplay && ready() && !media.matches) timer = timeline.setTimeout(demo, 1500); };
    const animate = async (element: HTMLElement, frames: Keyframe[], duration: number, delay = 0) => {
      const a = timeline.track(element.animate(frames, { duration, delay, easing: cardEasing(t), fill: 'both' })); animations.push(a);
      try { await a.finished; return true; } catch { return false; }
    };
    const springTo = (target: number) => {
      const initial = x, initialY = y, begun = timeline.now(), strength = t.kind === 'stack-fan-swipe' ? t.snapStrength : t.returnSpring;
      const tick = (now: number) => {
        if (!ready()) return;
        const f = Math.min(1, (now - begun) / t.duration), time = 10 * strength * f;
        const end = 1 - Math.exp(-10 * strength) * (1 + 10 * strength);
        const progress = f === 1 ? 1 : (1 - Math.exp(-time) * (1 + time)) / end;
        x = initial + (target - initial) * progress; y = initialY * (1 - progress); render();
        if (f < 1) raf = timeline.requestAnimationFrame(tick);
        else { if (t.kind === 'stack-fan-swipe') { const shift = Math.round(-target / t.fanSpread); cards.forEach((card, i) => card.dataset.tone = String((Number(card.dataset.tone ?? i) + shift + 30) % 3)); } x = 0; y = 0; render(); revealFanContent(); schedule(); }
      };
      raf = timeline.requestAnimationFrame(tick);
    };
    const releaseDismiss = async (cancel: boolean) => {
      if (cancel || !dismissDecision(x, y, velocity, node.clientWidth, t)) { springTo(0); return; }
      const current = generation, card = cards[0];
      const length = Math.max(1, Math.hypot(x, y));
      const exit = Math.max(t.exitDistance, node.clientWidth + card.clientWidth);
      const ex = t.dismissDirection === 'free' ? x / length * exit : (x < 0 ? -exit : exit);
      const ey = t.dismissDirection === 'free' ? y / length * exit : 0;
      const from = getComputedStyle(card).transform;
      if (await animate(card, [{ transform: from, opacity: .88 }, { transform: `translate(calc(-50% + ${ex}px), calc(-50% + ${ey}px)) rotate(${Math.sign(ex) * t.rotationIntensity * 1.5}deg)`, opacity: 0 }], t.duration)) {
        if (current !== generation) return;
        // Recycle only after the active card has completely left the viewport.
        stop(); cards.forEach((item, i) => item.dataset.tone = String((Number(item.dataset.tone ?? i) + 1) % 3)); x = 0; y = 0; render(); schedule();
      }
    };
    const flip = async () => {
      stop(); const current = generation, rotator = node.querySelector<HTMLElement>('[data-flip-rotator]')!;
      if (media.matches) { back = !back; rotator.style.transform = `rotate${t.flipAxis.toUpperCase()}(${back ? 180 : 0}deg)`; return; }
      const succeeded = await animate(rotator, flipFrames(t, back), t.duration);
      if (succeeded && current === generation) { back = !back; schedule(); }
    };
    const cycle = async (direction = -1) => {
      const from = getComputedStyle(cards[0]).transform;
      const rearFrom = cards.slice(1).map(card => getComputedStyle(card).transform);
      stop(); if (media.matches) { cards.push(cards.shift()!); render(); return; }
      const current = generation, front = cards[0];
      const outward = `translate(calc(-50% - ${-direction * node.clientWidth * .35}px), -50%) rotate(${direction * 12}deg) scale(${t.inactiveScale})`;
      cards.slice(1).forEach((card, i) => { void animate(card, [{ transform: rearFrom[i] }, { transform: stackTransform(i, t) }], t.duration); });
      if (!await animate(front, [{ transform: from }, { transform: outward }], t.duration / 2) || current !== generation) return;
      front.style.zIndex = '0';
      if (!await animate(front, [{ transform: outward }, { transform: stackTransform(4, t) }], t.duration / 2) || current !== generation) return;
      stop(); x = 0; y = 0; cards.push(cards.shift()!); render(); schedule();
    };
    function demo() {
      stop(); if (!ready() || media.matches || dragging) return;
      if (t.kind === 'flip-reveal') { void flip(); return; }
      if (t.kind === 'stack-card-cycle') { void cycle(); return; }
      const begun = timeline.now();
      const tick = (now: number) => {
        if (!ready()) return;
        const progress = Math.min(1, (now - begun) / 500);
        x = t.kind === 'stack-fan-swipe' ? -t.fanSpread * .8 * progress : (t.dismissDirection === 'left' ? -1 : 1) * node.clientWidth * .45 * progress;
        y = 0; render();
        if (progress < 1) raf = timeline.requestAnimationFrame(tick);
        else if (t.kind === 'stack-fan-swipe') springTo(-t.fanSpread); else { velocity = 0; void releaseDismiss(false); }
      };
      raf = timeline.requestAnimationFrame(tick);
    }
    events.current = {
      down(event) { if (timeline.paused || !enabled) return; if (!['stack-fan-swipe', 'swipe-dismiss', 'stack-card-cycle'].includes(t.kind) || media.matches) return; stop(); suppressClick = false; dragging = true; sx = event.clientX - x; sy = event.clientY - y; lastX = event.clientX; lastY = event.clientY; lastTime = timeline.now(); velocity = 0; node.setPointerCapture(event.pointerId); },
      move(event) { if (!dragging || timeline.paused) return; const now = timeline.now(); velocity = Math.hypot(event.clientX - lastX, t.dismissDirection === 'free' ? event.clientY - lastY : 0) / Math.max(1, now - lastTime); lastX = event.clientX; lastY = event.clientY; lastTime = now; if (Math.abs(event.clientX - sx) > 5) suppressClick = true; x = (event.clientX - sx) * (t.kind === 'stack-fan-swipe' ? t.swipeSensitivity : 1); y = t.kind === 'swipe-dismiss' && t.dismissDirection === 'free' ? event.clientY - sy : 0; render(); if (t.kind === 'stack-card-cycle' && Math.abs(x) >= node.clientWidth * .35) { dragging = false; void cycle(Math.sign(x)); } },
      up(cancel) { if (!dragging || timeline.paused) return; dragging = false; if (timeline.now() - lastTime > 100) velocity = 0; if (t.kind === 'stack-card-cycle') {
        const offset = x;
        if (!cancel && (Math.abs(offset) > node.clientWidth * .18 || (Math.abs(offset) > 8 && velocity > .65))) { void cycle(Math.sign(offset) || -1); }
        else { const current = generation; cards.slice(1).forEach((card, i) => { void animate(card, [{ transform: getComputedStyle(card).transform }, { transform: stackTransform(i + 1, t) }], t.duration); }); void animate(cards[0], [{ transform: getComputedStyle(cards[0]).transform }, { transform: stackTransform(0, t) }], t.duration).then(done => { if (done && current === generation) { stop(); x = 0; render(); schedule(); } }); }
      } else if (t.kind === 'stack-fan-swipe') springTo(cancel ? 0 : Math.max(-2, Math.min(2, Math.round(x / t.fanSpread))) * t.fanSpread); else void releaseDismiss(cancel); },
      click() { if (suppressClick) { suppressClick = false; return; } if (timeline.paused || !enabled) return; if (t.kind === 'flip-reveal') void flip(); else if (t.kind === 'stack-card-cycle') void cycle(); },
    };
    const reset = () => {
      stop(); dragging = false; x = 0; y = 0; render();
      if (t.kind === 'flip-reveal') { const rotator = node.querySelector<HTMLElement>('[data-flip-rotator]'); if (rotator) rotator.style.transform = `rotate${t.flipAxis.toUpperCase()}(${back ? 180 : 0}deg)`; }
      if ((!enabled || media.matches) && t.kind === 'stack-fan-swipe') cards[2].querySelectorAll<HTMLElement>('.ml-demo-title-bar, .ml-demo-text-bar').forEach(part => { part.style.opacity = '1'; });
      if (!ready() || media.matches) return;
      revealFanContent();
      if (autoplay) { if (t.kind === 'stack-fan-swipe') schedule(); else timer = timeline.setTimeout(demo, 650); }
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reset(); }); observer.observe(node);
    const resize = new ResizeObserver(render); resize.observe(node);
    document.addEventListener('visibilitychange', reset); media.addEventListener('change', reset); reset();
    return () => { stop(); timeline.dispose(); clock.current = null; observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', reset); media.removeEventListener('change', reset); events.current = null; };
  }, [signature, autoplay, replay, enabled]);
  const skeleton = <><span className="ml-swipe-image" /><span className="ml-demo-title-bar" /><span className="ml-demo-text-bar" /><span className="ml-demo-text-bar" /></>;
  return <div ref={root} className={`ml-advanced-card-scene ml-advanced-${t.kind}`} style={{ perspective: `${t.perspective}px`, '--fan-height': `${t.fanHeight}%`, '--fan-half-height': `${t.fanHeight / 2}%` } as React.CSSProperties} onPointerDown={e => { e.stopPropagation(); events.current?.down(e); }} onPointerMove={e => events.current?.move(e)} onPointerUp={() => events.current?.up(false)} onPointerCancel={() => events.current?.up(true)} onLostPointerCapture={() => events.current?.up(true)} onClick={e => { e.stopPropagation(); events.current?.click(); }}>
    {t.kind === 'flip-reveal' ? <div className="ml-flip-frame"><div className="ml-flip-rotator" data-flip-rotator><div className="ml-flip-face" aria-hidden="true">{skeleton}</div><div className="ml-flip-face ml-flip-back" style={{ transform: t.flipAxis === 'x' ? 'rotateX(180deg)' : 'rotateY(180deg)' }} aria-hidden="true">{skeleton}</div></div></div> : Array.from({ length: ['stack-fan-swipe', 'stack-card-cycle'].includes(t.kind) ? 5 : t.kind === 'swipe-dismiss' ? 3 : 1 }, (_, i) => <div className="ml-advanced-card" data-advanced-card data-tone={i % 3} aria-hidden="true" key={i}>{skeleton}</div>)}
  </div>;
}
