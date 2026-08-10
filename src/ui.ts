import { GAME, PALETTE } from './config';
import type { Score } from './score';

const el = (id: string): HTMLElement => document.getElementById(id)!;

export class UI {
  private count = el('count');
  private best = el('best');
  private pips = el('pips');
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
      b.addEventListener('click', () => window.location.reload());
    });
  }

  update(s: Score): void {
    this.count.textContent = `${s.blocks} / ${GAME.MAX_BLOCKS}`;
    this.best.textContent = `BEST ${s.best}`;
    this.pips.replaceChildren(
      ...Array.from({ length: Math.min(s.streak, 15) }, () => document.createElement('span')),
    );
  }

  showStart(): void {
    this.overlays.start.classList.remove('hidden');
  }

  hideOverlays(): void {
    Object.values(this.overlays).forEach((o) => o.classList.add('hidden'));
  }

  showLost(s: Score): void {
    el('lost-stats').textContent = `${s.blocks} STACKED · BEST ${s.best}`;
    this.overlays.lost.classList.remove('hidden');
  }

  showWon(s: Score): void {
    el('won-stats').textContent = `MONOLITH COMPLETE · ${s.perfects} PERFECT`;
    this.overlays.won.classList.remove('hidden');
  }
}
