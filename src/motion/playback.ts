import { createPreviewTimeline } from './previewTimeline';
import type { MotionConfig } from './config';
// Browser event ownership is isolated so disposal and reduced motion can be tested.
export function startPreviewPlayback(container: HTMLElement, node: HTMLElement, config: MotionConfig, autoplay: boolean, onReduced: (value: boolean) => void) {
  const timeline = createPreviewTimeline();
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let disposed = false;
  let animations: Animation[] = [];
  let timer: number | undefined;
  let highlights: HTMLElement[] = [];
  const stop = () => { timeline.clearTimeout(timer); animations.forEach(animation => animation.cancel()); animations = []; highlights.forEach(part => part.remove()); highlights = []; };
  const play = () => {
    stop();
    if (disposed || media.matches || !visible || document.hidden) return;
    const parts = config.sequence ? Array.from(node.querySelectorAll<HTMLElement>('[data-motion-part]')) : [node];
    animations = parts.map((part, index) => timeline.track(part.animate(config.frames, {
      duration: config.duration, easing: config.easing, fill: 'both',
      ...(config.sequence || config.previewLeadIn ? { delay: config.previewLeadIn + (config.sequence?.[index] ?? (config.sequence ? index * (config.parameters.stagger ?? 80) : 0)) } : {}),
      ...(autoplay && config.repeatDelay === 0 ? { iterations: Infinity } : {}),
    })));
    config.contentTracks.forEach(track => {
      if (track.selector === '[data-highlight]') {
        node.querySelectorAll<HTMLElement>(track.selector).forEach(phrase => {
          const host = phrase.closest<HTMLElement>('.ml-highlight-paragraph')!;
          const bounds = host.getBoundingClientRect();
          const lines = Array.from(phrase.getClientRects()).filter(rect => rect.width > 0);
          const totalWidth = lines.reduce((sum, rect) => sum + rect.width, 0);
          let elapsed = 0;
          lines.forEach(rect => {
            const part = document.createElement('span'); part.className = 'ml-highlight-line';
            const lineDuration = track.duration * rect.width / Math.max(1, totalWidth);
            Object.assign(part.style, { left: `${rect.left - bounds.left}px`, top: `${rect.top - bounds.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, opacity: String(config.parameters.sweepIntensity ?? .7), transformOrigin: config.parameters.sweepDirection === 'left' ? 'right center' : 'left center' });
            host.appendChild(part); highlights.push(part);
            const frames: Keyframe[] = track.iterations === Infinity
              ? [{ transform: 'scaleX(0)', offset: 0 }, { transform: 'scaleX(0)', offset: elapsed / track.duration }, { transform: 'scaleX(1)', offset: (elapsed + lineDuration) / track.duration }, { transform: 'scaleX(1)', offset: 1 }]
              : [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];
            animations.push(timeline.track(part.animate(frames, { delay: track.delay + (track.iterations === Infinity ? 0 : elapsed), duration: track.iterations === Infinity ? track.duration : lineDuration, iterations: track.iterations ?? 1, easing: 'linear', fill: 'both' })));
            elapsed += lineDuration;
          });
        });
        return;
      }

      node.querySelectorAll<HTMLElement>(track.selector).forEach(part => animations.push(timeline.track(part.animate(track.frames, {
        delay: config.previewLeadIn + track.delay, duration: track.duration, easing: track.easing ?? (track.iterations ? 'linear' : 'ease-out'), fill: 'both', iterations: track.iterations ?? 1,
      }))));
    });
    if (autoplay && config.repeatDelay > 0) timer = timeline.setTimeout(play, config.previewLeadIn + config.duration + (config.sequence?.[config.sequence.length - 1] ?? 0) + config.repeatDelay);
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) play(); else stop();
  });
  observer.observe(container);
  const preference = () => { onReduced(media.matches); play(); };
  const visibility = () => { if (document.hidden) stop(); else play(); };
  preference();
  media.addEventListener('change', preference);
  document.addEventListener('visibilitychange', visibility);
  return {
    replay: play,
    track: timeline.track,
    setPaused: timeline.setPaused,
    dispose() {
      disposed = true;
      stop(); timeline.dispose();
      observer.disconnect();
      media.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}
