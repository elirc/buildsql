// d09_emitters / ex8 - reference solution (author only, used by `dojo verify`).
import type { EventEmitter } from "node:events";

export function onceWithSignal<T>(
  emitter: EventEmitter,
  name: string,
  signal: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Checked before anything is attached: an already-aborted caller must not
    // leave a listener behind on a long-lived emitter.
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const onEvent = (value: T): void => {
      cleanup();
      resolve(value);
    };
    const onAbort = (): void => {
      cleanup();
      reject(signal.reason);
    };

    function cleanup(): void {
      emitter.off(name, onEvent as (...args: unknown[]) => void);
      signal.removeEventListener("abort", onAbort);
    }

    emitter.on(name, onEvent as (...args: unknown[]) => void);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
