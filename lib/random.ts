// ============================================================
// SEEDED RANDOM — Deterministic pseudo-random number generator
// Uses a simple mulberry32 algorithm for reproducibility
// ============================================================

export function createRng(seed: number) {
  let s = seed | 0;

  return {
    /** Returns a float in [0, 1) */
    next(): number {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },

    /** Returns a float in [min, max) */
    range(min: number, max: number): number {
      return min + this.next() * (max - min);
    },

    /** Returns an integer in [min, max] (inclusive) */
    int(min: number, max: number): number {
      return Math.floor(this.range(min, max + 1));
    },
  };
}
