import { AUDIO } from './config';

// Procedural WebAudio — zero assets, zero licensing, zero GDPR surface.
// The context is created lazily on the first user gesture (autoplay policy).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = localStorage.getItem(AUDIO.MUTE_KEY) === '1';

export function ensureAudio(): void {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : AUDIO.VOLUME;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null; // no audio available — the game plays silent
  }
}

export function toggleMute(): boolean {
  muted = !muted;
  localStorage.setItem(AUDIO.MUTE_KEY, muted ? '1' : '0');
  if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : AUDIO.VOLUME, ctx.currentTime, 0.01);
  return muted;
}

export const isMuted = (): boolean => muted;

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = 'square',
  gain = 0.5,
  delay = 0,
  slideTo?: number,
): void {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Pentatonic steps rising with the streak (A minor pentatonic, one octave up
// every 5 perfects, capped).
const PENTA = [0, 3, 5, 7, 10];
export const sfx = {
  drop(): void {
    tone(190, 0.05, 'square', 0.35);
  },
  perfect(streak: number): void {
    const step = Math.min(streak - 1, 14);
    const semis = PENTA[step % 5] + 12 * Math.floor(step / 5);
    const f = 440 * 2 ** (semis / 12);
    tone(f, 0.16, 'triangle', 0.7);
    tone(f * 2, 0.22, 'sine', 0.35, 0.03);
  },
  trim(): void {
    tone(140, 0.1, 'sawtooth', 0.5, 0, 70);
    tone(60, 0.18, 'sine', 0.45, 0.02);
  },
  miss(): void {
    tone(90, 0.5, 'sine', 0.8, 0, 36);
  },
  win(): void {
    [0, 4, 7, 12].forEach((s, i) => tone(330 * 2 ** (s / 12), 0.7, 'triangle', 0.4, i * 0.16));
  },
};
