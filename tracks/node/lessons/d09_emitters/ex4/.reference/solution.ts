// d09_emitters / ex4 - reference solution (author only, used by `dojo verify`).

export type Listener = (...args: unknown[]) => void;

export interface StickyEmitter {
  emit(event: string, ...args: unknown[]): boolean;
  on(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
  buffered(event: string): number;
}

export function createStickyEmitter(): StickyEmitter {
  const listeners = new Map<string, Listener[]>();
  const backlog = new Map<string, unknown[][]>();

  return {
    emit(event: string, ...args: unknown[]): boolean {
      const current = listeners.get(event) ?? [];
      if (current.length === 0) {
        const waiting = backlog.get(event) ?? [];
        waiting.push(args);
        backlog.set(event, waiting);
        return false;
      }
      // A copy, so a listener that unsubscribes mid-dispatch cannot make the
      // loop skip the one behind it.
      for (const listener of [...current]) listener(...args);
      return true;
    },

    on(event: string, listener: Listener): void {
      const current = listeners.get(event) ?? [];
      const wasEmpty = current.length === 0;
      current.push(listener);
      listeners.set(event, current);

      if (!wasEmpty) return;
      const waiting = backlog.get(event);
      if (!waiting) return;
      // Spend the backlog: delete first, so a listener that emits during the
      // replay cannot be replayed to itself.
      backlog.delete(event);
      for (const args of waiting) listener(...args);
    },

    off(event: string, listener: Listener): void {
      const current = listeners.get(event);
      if (!current) return;
      const index = current.indexOf(listener);
      if (index >= 0) current.splice(index, 1);
    },

    buffered(event: string): number {
      return backlog.get(event)?.length ?? 0;
    },
  };
}
