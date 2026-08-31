// d09_emitters / ex2 - reference solution (author only, used by `dojo verify`).
import type { EventEmitter } from "node:events";

export interface FirstEvent {
  event: string;
  args: unknown[];
}

export function firstOf(
  emitter: EventEmitter,
  names: readonly string[],
): Promise<FirstEvent> {
  return new Promise<FirstEvent>((resolve, reject) => {
    // Keep what was added so exactly that can be removed - never
    // removeAllListeners, which would take other people's listeners with it.
    const added: Array<[string, (...args: unknown[]) => void]> = [];

    const cleanup = (): void => {
      for (const [event, listener] of added) emitter.off(event, listener);
      added.length = 0;
    };

    const onError = (error: unknown): void => {
      cleanup();
      reject(error);
    };
    emitter.on("error", onError);
    added.push(["error", onError as (...args: unknown[]) => void]);

    for (const name of names) {
      const listener = (...args: unknown[]): void => {
        cleanup();
        resolve({ event: name, args });
      };
      emitter.on(name, listener);
      added.push([name, listener]);
    }
  });
}
