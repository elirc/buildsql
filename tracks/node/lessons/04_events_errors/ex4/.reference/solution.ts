// 04_events_errors / ex4 - reference solution (author only, used by `dojo verify`).
import type { EventEmitter } from "node:events";

export function collectUntilEnd<T>(source: EventEmitter): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const items: T[] = [];

    const onData = (item: T): void => {
      items.push(item);
    };
    const onEnd = (): void => {
      cleanup();
      resolve(items);
    };
    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };
    const cleanup = (): void => {
      source.off("data", onData);
      source.off("end", onEnd);
      source.off("error", onError);
    };

    source.on("data", onData);
    source.once("end", onEnd);
    source.once("error", onError);
  });
}
