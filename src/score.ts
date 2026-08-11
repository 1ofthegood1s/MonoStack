import { SCORING, STORAGE_KEY, STORAGE_KEY_POINTS } from './config';

export class Score {
  blocks = 0; // the height score: blocks stacked this run
  streak = 0; // consecutive perfects; resets on a trim
  perfects = 0;
  points = 0;
  best = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  bestPoints = Number(localStorage.getItem(STORAGE_KEY_POINTS) ?? 0);

  place(perfect: boolean): void {
    this.blocks++;
    if (perfect) {
      this.perfects++;
      this.streak++;
      this.points += SCORING.PERFECT * this.streak;
    } else {
      this.streak = 0;
      this.points += SCORING.BASE;
    }
    if (this.blocks > this.best) {
      this.best = this.blocks;
      localStorage.setItem(STORAGE_KEY, String(this.best));
    }
    if (this.points > this.bestPoints) {
      this.bestPoints = this.points;
      localStorage.setItem(STORAGE_KEY_POINTS, String(this.bestPoints));
    }
  }
}
