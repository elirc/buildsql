// d09_emitters / ex7 - reference solution (author only, used by `dojo verify`).

export interface CoalescingEmitter {
  push(value: string): void;
  on(listener: (batch: string[]) => void): void;
  flush(): void;
  pending(): number;
}

export function createCoalescingEmitter(options: {
  windowMs: number;
}): CoalescingEmitter {
  const listeners: ((batch: string[]) => void)[] = [];
  let buffer: string[] = [];
  let handle: ReturnType<typeof setTimeout> | undefined;

  const deliver = (): void => {
    if (handle !== undefined) {
      clearTimeout(handle);
      handle = undefined;
    }
    if (buffer.length === 0) return; // an empty batch is not a batch
    const batch = buffer;
    // A new array, not buffer.length = 0: the listeners are holding this one.
    buffer = [];
    for (const listener of listeners) listener(batch);
  };

  return {
    push(value: string): void {
      buffer.push(value);
      // Only if no window is open. Re-arming here would make this a debounce,
      // and a busy producer could hold a value back forever.
      if (handle === undefined) {
        handle = setTimeout(() => {
          handle = undefined;
          deliver();
        }, options.windowMs);
      }
    },
    on(listener): void {
      listeners.push(listener);
    },
    flush: deliver,
    pending: () => buffer.length,
  };
}
