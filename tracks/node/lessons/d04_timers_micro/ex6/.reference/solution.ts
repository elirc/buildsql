// d04_timers_micro / ex6 - reference solution (author only, used by `dojo verify`).

export interface Scheduler {
  at(time: number, run: () => void): void;
  advanceTo(time: number): number;
  now(): number;
  pending(): number;
}

interface Entry {
  time: number;
  /** insertion order, so entries due at the same instant keep their order */
  seq: number;
  run: () => void;
}

export function createScheduler(): Scheduler {
  const entries: Entry[] = [];
  let seq = 0;
  let current = 0;

  return {
    at(time: number, run: () => void): void {
      seq += 1;
      entries.push({ time, seq, run });
    },

    advanceTo(time: number): number {
      if (time < current) throw new Error("time cannot go backwards");
      current = time;

      let ran = 0;
      // Re-scan every pass: a callback may have added something that is also
      // due, and it has to run in this same advance.
      for (;;) {
        let next: Entry | undefined;
        for (const entry of entries) {
          if (entry.time > current) continue;
          if (
            next === undefined ||
            entry.time < next.time ||
            (entry.time === next.time && entry.seq < next.seq)
          ) {
            next = entry;
          }
        }
        if (next === undefined) return ran;
        entries.splice(entries.indexOf(next), 1);
        ran += 1;
        next.run();
      }
    },

    now(): number {
      return current;
    },

    pending(): number {
      return entries.length;
    },
  };
}
