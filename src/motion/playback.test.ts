import { afterEach, describe, expect, it, vi } from 'vitest';
import { startPreviewPlayback } from './playback';
import { motionConfig } from './config';
import { motionPresets } from './presets';
function setup(reduced = false, autoplay = true, presetId?: string) {
  vi.useFakeTimers();
  let enter: (entries: { isIntersecting: boolean }[]) => void = () => {};
  const media = { matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const doc = { hidden: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const disconnect = vi.fn();
  vi.stubGlobal('window', { matchMedia: () => media });
  vi.stubGlobal('document', doc);
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof enter) { enter = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const cancel = vi.fn();
  const animate = vi.fn(() => ({ cancel }));
  const preset = motionPresets.find(p => p.id === presetId) ?? motionPresets.find(p => p.id === 'fade-in')!;
  const config = motionConfig(preset, presetId ? preset.defaultParameters : { ...preset.defaultParameters, stagger: undefined });
  const onReduced = vi.fn();
  const parts = Array.from({ length: 4 }, () => ({ animate: vi.fn(() => ({ cancel })) }));
  const playback = startPreviewPlayback({} as HTMLElement, { animate, querySelectorAll: () => parts } as unknown as HTMLElement, config, autoplay, onReduced);
  return { enter: (visible: boolean) => enter([{ isIntersecting: visible }]), media, doc, disconnect, animate, cancel, playback, config, onReduced, parts };
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('preview playback lifecycle', () => {
  it('waits for viewport entry, plays once, pauses 1400ms, then replays', () => {
    const s = setup();
    expect(s.animate).not.toHaveBeenCalled();
    s.enter(true);
    expect(s.animate).toHaveBeenCalledWith(s.config.frames, { duration: 400, easing: s.config.easing, fill: 'both' });
    vi.advanceTimersByTime(1799);
    expect(s.animate).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(s.animate).toHaveBeenCalledTimes(2);
    s.playback.dispose();
  });
  it('restarts on replay and cancels timers when outside the viewport or disposed', () => {
    const s = setup();
    s.enter(true);
    s.playback.replay();
    expect(s.animate).toHaveBeenCalledTimes(2);
    s.enter(false);
    vi.advanceTimersByTime(5000);
    expect(s.animate).toHaveBeenCalledTimes(2);
    s.playback.dispose();
    s.playback.replay();
    expect(s.disconnect).toHaveBeenCalledOnce();
    expect(s.animate).toHaveBeenCalledTimes(2);
    expect(s.media.removeEventListener).toHaveBeenCalled();
    expect(s.doc.removeEventListener).toHaveBeenCalled();
  });
  it('disables movement for reduced motion and responds to preference changes', () => {
    const s = setup(true);
    s.enter(true);
    s.playback.replay();
    vi.advanceTimersByTime(5000);
    expect(s.animate).not.toHaveBeenCalled();
    expect(s.onReduced).toHaveBeenCalledWith(true);
    s.media.matches = false;
    s.media.addEventListener.mock.calls[0][1]();
    expect(s.animate).toHaveBeenCalledOnce();
    s.media.matches = true;
    s.media.addEventListener.mock.calls[0][1]();
    vi.advanceTimersByTime(5000);
    expect(s.animate).toHaveBeenCalledOnce();
    s.playback.dispose();
  });
  it('stages title and items in order and waits for the last item before replay', () => {
    const s = setup(false, true, 'list-reveal');
    s.enter(true);
    s.parts.forEach((part, index) => expect(part.animate).toHaveBeenCalledWith(s.config.frames, expect.objectContaining({ delay: index * 80 })));
    vi.advanceTimersByTime(s.config.duration + 240 + 1399);
    expect(s.parts[0].animate).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1);
    expect(s.parts[0].animate).toHaveBeenCalledTimes(2);
    s.playback.dispose();
  });
  it('holds the sidebar visibly before demonstrating expansion and waits before replaying', () => {
    const s = setup(false, true, 'sidebar-expand');
    s.enter(true);
    expect(s.animate).toHaveBeenCalledWith(s.config.frames, expect.objectContaining({ delay: 650, fill: 'both' }));
    vi.advanceTimersByTime(s.config.duration + 650 + 1399);
    expect(s.animate).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1);
    expect(s.animate).toHaveBeenCalledTimes(2);
    s.playback.dispose();
  });
  it('keeps loading loops continuous without replay gaps', () => {
    const s = setup(false, true, 'spinner');
    s.enter(true);
    expect(s.animate).toHaveBeenCalledWith(s.config.frames, expect.objectContaining({ iterations: Infinity, easing: 'linear' }));
    vi.advanceTimersByTime(5000);
    expect(s.animate).toHaveBeenCalledOnce();
    s.playback.dispose();
    expect(s.cancel).toHaveBeenCalled();
  });
  it('pauses in hidden tabs and supports one-shot previews', () => {
    const s = setup(false, false);
    s.enter(true);
    vi.advanceTimersByTime(5000);
    expect(s.animate).toHaveBeenCalledOnce();
    s.doc.hidden = true;
    s.doc.addEventListener.mock.calls[0][1]();
    s.playback.replay();
    expect(s.animate).toHaveBeenCalledOnce();
    s.doc.hidden = false;
    s.doc.addEventListener.mock.calls[0][1]();
    expect(s.animate).toHaveBeenCalledTimes(2);
    s.playback.dispose();
  });
});
