// d05_promise_basics / ex8 - reference solution (author only, used by `dojo verify`).

export interface MinimalThenable<T> {
  then(
    onFulfilled?: ((value: T) => void) | null,
    onRejected?: ((reason: unknown) => void) | null,
  ): void;
}

export interface Settleable<T> {
  thenable: MinimalThenable<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
}

type State = "pending" | "fulfilled" | "rejected";

interface Handlers<T> {
  onFulfilled?: ((value: T) => void) | null;
  onRejected?: ((reason: unknown) => void) | null;
}

export function createSettleable<T>(): Settleable<T> {
  let state: State = "pending";
  let value: T;
  let reason: unknown;
  const waiting: Handlers<T>[] = [];

  /** One handler pair, delivered on the microtask queue - never inline. */
  const deliver = (handlers: Handlers<T>): void => {
    queueMicrotask(() => {
      if (state === "fulfilled") handlers.onFulfilled?.(value);
      else handlers.onRejected?.(reason);
    });
  };

  const settle = (next: State, payload: unknown): void => {
    if (state !== "pending") return;
    state = next;
    if (next === "fulfilled") value = payload as T;
    else reason = payload;
    // Registration order is preserved because the queue is drained in order
    // and each entry is scheduled in order.
    while (waiting.length > 0) deliver(waiting.shift() as Handlers<T>);
  };

  return {
    thenable: {
      then(onFulfilled, onRejected): void {
        const handlers: Handlers<T> = { onFulfilled, onRejected };
        if (state === "pending") waiting.push(handlers);
        else deliver(handlers);
      },
    },
    resolve(next: T): void {
      settle("fulfilled", next);
    },
    reject(next: unknown): void {
      settle("rejected", next);
    },
  };
}
