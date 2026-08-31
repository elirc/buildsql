// d04_timers_micro / ex1 - reference solution (author only, used by `dojo verify`).

export function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function immediate(): Promise<void> {
  // Promise.resolve() is already a settled promise; awaiting it costs one
  // microtask and nothing else. No timer means nothing to clear and nothing
  // keeping the process alive.
  return Promise.resolve();
}
