// d04_timers_micro / ex5 - reference solution (author only, used by `dojo verify`).

export interface PollOptions {
  intervalMs: number;
  timeoutMs: number;
}

export function pollUntil(check: () => boolean, options: PollOptions): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let attempts = 0;
    let poll: ReturnType<typeof setTimeout> | undefined;

    const deadline = setTimeout(() => {
      cleanup();
      reject(new Error(`timed out after ${options.timeoutMs}ms`));
    }, options.timeoutMs);

    function cleanup(): void {
      if (poll !== undefined) clearTimeout(poll);
      poll = undefined;
      clearTimeout(deadline);
    }

    const attempt = (): void => {
      attempts += 1;
      if (check()) {
        cleanup();
        resolve(attempts);
        return;
      }
      poll = setTimeout(attempt, options.intervalMs);
    };

    // The first check is free: something already true must not wait an interval.
    attempt();
  });
}
