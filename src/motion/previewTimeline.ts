// A local clock freezes both animation frames and replay timers at the same instant.
export function createPreviewTimeline() {
  let paused = false, pausedAt = 0, elapsedPause = 0, nextId = 0;
  const frames = new Map<number, { callback: FrameRequestCallback; handle?: number }>();
  const timers = new Map<number, { callback: () => void; due: number; handle?: ReturnType<typeof setTimeout> }>();
  const animations = new Set<Animation>();
  const now = () => (paused ? pausedAt : performance.now()) - elapsedPause;
  const scheduleFrame = (id: number) => {
    const item = frames.get(id); if (!item || paused) return;
    item.handle = requestAnimationFrame(() => { frames.delete(id); item.callback(now()); });
  };
  const scheduleTimer = (id: number) => {
    const item = timers.get(id); if (!item || paused) return;
    item.handle = setTimeout(() => { timers.delete(id); item.callback(); }, Math.max(0, item.due - now()));
  };
  return {
    now,
    get paused() { return paused; },
    requestAnimationFrame(callback: FrameRequestCallback) { const id = ++nextId; frames.set(id, { callback }); scheduleFrame(id); return id; },
    cancelAnimationFrame(id: number) { const item = frames.get(id); if (item?.handle !== undefined) cancelAnimationFrame(item.handle); frames.delete(id); },
    setTimeout(callback: () => void, delay: number) { const id = ++nextId; timers.set(id, { callback, due: now() + delay }); scheduleTimer(id); return id; },
    clearTimeout(id: number | undefined) { if (id === undefined) return; const item = timers.get(id); if (item?.handle !== undefined) clearTimeout(item.handle); timers.delete(id); },
    track(animation: Animation) { animations.add(animation); if (paused) animation.pause(); animation.finished?.then(() => animations.delete(animation), () => animations.delete(animation)); return animation; },
    setPaused(value: boolean) {
      if (value === paused) return;
      if (value) {
        pausedAt = performance.now(); paused = true;
        frames.forEach(item => { if (item.handle !== undefined) cancelAnimationFrame(item.handle); });
        timers.forEach(item => { if (item.handle !== undefined) clearTimeout(item.handle); });
        animations.forEach(animation => animation.pause());
      } else {
        elapsedPause += performance.now() - pausedAt; paused = false;
        frames.forEach((_item, id) => scheduleFrame(id)); timers.forEach((_item, id) => scheduleTimer(id));
        animations.forEach(animation => { if (animation.playState !== 'finished' && animation.playState !== 'idle') animation.play(); });
      }
    },
    dispose() { frames.forEach(item => { if (item.handle !== undefined) cancelAnimationFrame(item.handle); }); timers.forEach(item => { if (item.handle !== undefined) clearTimeout(item.handle); }); animations.forEach(animation => animation.cancel()); frames.clear(); timers.clear(); animations.clear(); },
  };
}
