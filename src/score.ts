import { STORAGE_KEY } from './config';

export class Score {
  blocks = 0; // the live score: blocks stacked this run
  streak = 0; // consecutive perfects; resets on an imperfect placement
  perfects = 0;
  best = Number(localStorage.getItem(STORAGE_KEY) ?? 0);

  place(perfect: boolean): void {
    this.blocks++;
    if (perfect) {
      this.perfects++;
      this.streak++;
    } else {
      this.streak = 0;
    }
    if (this.blocks > this.best) {
      this.best = this.blocks;
      localStorage.setItem(STORAGE_KEY, String(this.best));
    }
  }
}
