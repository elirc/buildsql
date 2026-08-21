// i2_interview_drills / review1 - reference solution (author only, used by `dojo verify`).

export type BusListener = (...args: any[]) => void;

export interface Bus {
  on(event: string, listener: BusListener): void;
  once(event: string, listener: BusListener): void;
  off(event: string, listener: BusListener): void;
  emit(event: string, ...args: unknown[]): number;
}

export function createBus(): Bus {
  const listeners = new Map<string, BusListener[]>();
  const wrappers = new Map<BusListener, BusListener>();

  const bus: Bus = {
    on(event, listener) {
      const existing = listeners.get(event);
      if (existing) existing.push(listener);
      else listeners.set(event, [listener]);
    },

    once(event, listener) {
      const wrapper: BusListener = (...args) => {
        bus.off(event, wrapper);
        listener(...args);
      };
      wrappers.set(listener, wrapper);
      bus.on(event, wrapper);
    },

    off(event, listener) {
      const target = wrappers.get(listener) ?? listener;
      const existing = listeners.get(event);
      if (!existing) return;
      const index = existing.indexOf(target);
      if (index !== -1) existing.splice(index, 1);
      if (existing.length === 0) listeners.delete(event);
      wrappers.delete(listener);
    },

    emit(event, ...args) {
      let called = 0;
      // Copy before walking: a listener may add or remove listeners.
      for (const listener of [...(listeners.get(event) ?? [])]) {
        listener(...args);
        called += 1;
      }
      // Wildcard listeners are told which event it was, first.
      for (const listener of [...(listeners.get("*") ?? [])]) {
        listener(event, ...args);
        called += 1;
      }
      return called;
    },
  };

  return bus;
}
