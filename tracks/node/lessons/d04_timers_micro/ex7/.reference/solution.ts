// d04_timers_micro / ex7 - reference solution (author only, used by `dojo verify`).

export interface SelfCorrectingOptions {
  intervalMs: number;
  now: () => number;
  onTick: (n: number) => void;
}

export interface SelfCorrecting {
  start(): void;
  stop(): void;
}

export function createSelfCorrectingInterval(
  options: SelfCorrectingOptions,
): SelfCorrecting {
  let handle: ReturnType<typeof setTimeout> | undefined;
  let startedAt = 0;
  let count = 0;

  // setTimeout, not setInterval: the delay has to be recomputed every time.
  const arm = (): void => {
    const due = startedAt + (count + 1) * options.intervalMs;
    const wait = Math.max(0, due - options.now());
    handle = setTimeout(() => {
      handle = undefined;
      count += 1;
      options.onTick(count);
      arm();
    }, wait);
  };

  return {
    start(): void {
      if (handle !== undefined) return;
      startedAt = options.now();
      count = 0;
      arm();
    },
    stop(): void {
      if (handle !== undefined) clearTimeout(handle);
      handle = undefined;
    },
  };
}
