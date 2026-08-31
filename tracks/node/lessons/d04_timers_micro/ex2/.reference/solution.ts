// d04_timers_micro / ex2 - reference solution (author only, used by `dojo verify`).

export interface TickerOptions {
  intervalMs: number;
  onTick: (n: number) => void;
}

export interface Ticker {
  start(): void;
  stop(): void;
  ticks(): number;
  running(): boolean;
}

export function createTicker(options: TickerOptions): Ticker {
  // The handle IS the running flag: an interval you are holding is one you can
  // clear, and one you are not holding is one you have leaked.
  let handle: ReturnType<typeof setInterval> | undefined;
  let count = 0;

  return {
    start(): void {
      if (handle !== undefined) return;
      handle = setInterval(() => {
        count += 1;
        options.onTick(count);
      }, options.intervalMs);
    },
    stop(): void {
      if (handle === undefined) return;
      clearInterval(handle);
      handle = undefined;
    },
    ticks(): number {
      return count;
    },
    running(): boolean {
      return handle !== undefined;
    },
  };
}
