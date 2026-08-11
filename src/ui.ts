import { GAME, PALETTE } from './config';
import { isMuted, toggleMute } from './audio';
import type { Score } from './score';

const el = (id: string): HTMLElement => document.getElementById(id)!;

export class UI {
  onRestart?: () => void;
  private count = el('count');
  private best = el('best');
  private pips = el('pips');
  private points = el('points');
  private last: Score | null = null;
  private overlays = {
    start: el('overlay-start'),
    lost: el('overlay-lost'),
    won: el('overlay-won'),
  };

  constructor() {
    // The stylesheet reads the palette from config via CSS variables —
    // config.ts stays the single place a color is defined.
    for (const [name, hex] of Object.entries(PALETTE)) {
      document.documentElement.style.setProperty(`--${name}`, hex);
    }
    document.querySelectorAll('[data-restart]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => this.onRestart?.());
    });
    document.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => void this.share(b));
    });
    const mute = el('mute');
    const label = (): void => {
      mute.textContent = isMuted() ? 'SOUND OFF' : 'SOUND ON';
    };
    mute.addEventListener('pointerdown', (e) => e.stopPropagation());
    mute.addEventListener('click', () => {
      toggleMute();
      label();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        toggleMute();
        label();
      }
    });
    label();
  }

  update(s: Score): void {
    this.last = s;
    this.count.textContent = `${s.blocks} / ${GAME.MAX_BLOCKS}`;
    this.best.textContent = `BEST ${s.best} · ${s.bestPoints} PTS`;
    this.points.textContent = `${s.points} PTS`;
    this.pips.replaceChildren(
      ...Array.from({ length: Math.min(s.streak, 15) }, () => document.createElement('span')),
    );
  }

  // Zero-tracking share: static text via the native sheet, clipboard fallback.
  private async share(button: HTMLButtonElement): Promise<void> {
    const s = this.last;
    if (!s) return;
    const text = `I stacked the LILY Monolith — ${s.blocks}/${GAME.MAX_BLOCKS}, ${s.perfects} perfect, ${s.points} pts.`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        button.textContent = 'COPIED';
        setTimeout(() => (button.textContent = 'SHARE'), 1200);
      }
    } catch {
      /* user dismissed the sheet — nothing to do */
    }
  }

  showStart(): void {
    this.overlays.start.classList.remove('hidden');
  }

  hideOverlays(): void {
    Object.values(this.overlays).forEach((o) => o.classList.add('hidden'));
  }

  showLost(s: Score): void {
    const fromTop = GAME.MAX_BLOCKS - s.blocks;
    el('lost-stats').textContent =
      s.blocks >= 15
        ? `${fromTop} FROM THE TOP · ${s.points} PTS · BEST ${s.best}`
        : `${s.blocks} STACKED · ${s.points} PTS · BEST ${s.best}`;
    this.overlays.lost.classList.remove('hidden');
  }

  showWon(s: Score): void {
    el('won-stats').textContent = `MONOLITH COMPLETE · ${s.perfects} PERFECT · ${s.points} PTS`;
    this.overlays.won.classList.remove('hidden');
  }
}
