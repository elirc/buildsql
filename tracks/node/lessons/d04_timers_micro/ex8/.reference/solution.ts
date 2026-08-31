// d04_timers_micro / ex8 - reference solution (author only, used by `dojo verify`).

export interface DelayQueue {
  enqueue(delayMs: number, run: () => void): () => void;
  size(): number;
}

interface Entry {
  at: number;
  seq: number;
  run: () => void;
}

export function createDelayQueue(now: () => number): DelayQueue {
  const entries: Entry[] = [];
  let seq = 0;
  let handle: ReturnType<typeof setTimeout> | undefined;

  const earlier = (a: Entry, b: Entry): boolean =>
    a.at < b.at || (a.at === b.at && a.seq < b.seq);

  const remove = (entry: Entry): boolean => {
    const index = entries.indexOf(entry);
    if (index === -1) return false;
    entries.splice(index, 1);
    return true;
  };

  const rearm = (): void => {
    if (handle !== undefined) {
      clearTimeout(handle);
      handle = undefined;
    }
    if (entries.length === 0) return;
    const next = entries.reduce((best, entry) => (earlier(entry, best) ? entry : best));
    handle = setTimeout(fire, Math.max(0, next.at - now()));
  };

  function fire(): void {
    handle = undefined;
    const current = now();
    const due = entries
      .filter((entry) => entry.at <= current)
      .sort((a, b) => a.at - b.at || a.seq - b.seq);
    // Remove them all before running any, so a callback that enqueues more
    // work cannot disturb this pass.
    for (const entry of due) remove(entry);
    for (const entry of due) entry.run();
    rearm();
  }

  return {
    enqueue(delayMs: number, run: () => void): () => void {
      seq += 1;
      const entry: Entry = { at: now() + delayMs, seq, run };
      entries.push(entry);
      rearm();
      return () => {
        if (remove(entry)) rearm();
      };
    },
    size(): number {
      return entries.length;
    },
  };
}
