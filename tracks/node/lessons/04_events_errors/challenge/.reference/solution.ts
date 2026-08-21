// 04_events_errors / challenge - reference solution (author only, used by `dojo verify`).

export type Listener = (...args: any[]) => void;

export interface Emitter {
  on(event: string, listener: Listener): void;
  once(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
  emit(event: string, ...args: unknown[]): boolean;
}

export function createEmitter(): Emitter {
  const listeners = new Map<string, Listener[]>();
  // once() wraps the listener, so off() has to find the wrapper again.
  const wrappers = new Map<Listener, Listener>();

  const emitter: Emitter = {
    on(event, listener) {
      const existing = listeners.get(event);
      if (existing) existing.push(listener);
      else listeners.set(event, [listener]);
    },

    once(event, listener) {
      const wrapper: Listener = (...args) => {
        emitter.off(event, wrapper);
        listener(...args);
      };
      wrappers.set(listener, wrapper);
      emitter.on(event, wrapper);
    },

    off(event, listener) {
      const wrapper = wrappers.get(listener);
      const target = wrapper ?? listener;
      const existing = listeners.get(event);
      if (!existing) return;
      const index = existing.indexOf(target);
      if (index !== -1) existing.splice(index, 1);
      if (existing.length === 0) listeners.delete(event);
      if (wrapper) wrappers.delete(listener);
    },

    emit(event, ...args) {
      const existing = listeners.get(event);
      if (!existing || existing.length === 0) return false;
      // Copy first: a listener may add or remove listeners while we dispatch.
      for (const listener of [...existing]) listener(...args);
      return true;
    },
  };

  return emitter;
}
