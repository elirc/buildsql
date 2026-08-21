// i2_interview_drills / challenge - reference solution (author only).

export interface Store<S> {
  getState(): S;
  setState(updater: S | ((current: S) => S)): void;
  subscribe(listener: (state: S) => void): () => void;
  select<R>(selector: (state: S) => R): R;
}

export function createStore<S>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<(state: S) => void>();

  return {
    getState(): S {
      return state;
    },
    setState(updater: S | ((current: S) => S)): void {
      const next =
        typeof updater === "function" ? (updater as (current: S) => S)(state) : updater;
      if (Object.is(next, state)) {
        return;
      }
      state = next;
      for (const listener of [...listeners]) {
        listener(state);
      }
    },
    subscribe(listener: (state: S) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    select<R>(selector: (state: S) => R): R {
      return selector(state);
    },
  };
}
