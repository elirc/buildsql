// d09_emitters / ex6 - reference solution (author only, used by `dojo verify`).

export type Listener = (...args: unknown[]) => void;

export interface StrictEmitter {
  on(event: string, listener: Listener): void;
  once(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
  emit(event: string, ...args: unknown[]): boolean;
  listenerCount(event: string): number;
}

interface Registration {
  listener: Listener;
  once: boolean;
}

export function createStrictEmitter(): StrictEmitter {
  const registry = new Map<string, Registration[]>();

  const add = (event: string, listener: Listener, once: boolean): void => {
    const current = registry.get(event) ?? [];
    current.push({ listener, once });
    registry.set(event, current);
  };

  const remove = (event: string, listener: Listener): void => {
    const current = registry.get(event);
    if (!current) return;
    const index = current.findIndex((entry) => entry.listener === listener);
    if (index >= 0) current.splice(index, 1);
  };

  return {
    on: (event, listener) => add(event, listener, false),
    once: (event, listener) => add(event, listener, true),
    off: remove,

    emit(event, ...args): boolean {
      // A copy: listeners may register or remove listeners while running.
      const current = [...(registry.get(event) ?? [])];

      if (current.length === 0) {
        if (event !== "error") return false;
        // The one event whose absence of a listener is itself an error.
        const reason = args[0];
        throw reason instanceof Error
          ? reason
          : new Error(`unhandled error event: ${String(reason)}`);
      }

      for (const entry of current) {
        // Removed BEFORE it runs, so a listener that re-emits its own event
        // cannot find itself still registered.
        if (entry.once) remove(event, entry.listener);
        entry.listener(...args);
      }
      return true;
    },

    listenerCount: (event) => registry.get(event)?.length ?? 0,
  };
}
