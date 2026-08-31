// d08_promise_combinators / ex7 - reference solution (author only, used by `dojo verify`).

export type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export interface Landed<T> {
  index: number;
  result: Settled<T>;
}

export async function* settledStream<T>(
  promises: readonly Promise<T>[],
): AsyncGenerator<Landed<T>, void, undefined> {
  const landed: Landed<T>[] = [];
  //: set while the consumer is waiting for something to arrive
  let wake: (() => void) | undefined;
  let remaining = promises.length;

  const deliver = (entry: Landed<T>): void => {
    landed.push(entry);
    const notify = wake;
    wake = undefined;
    notify?.();
  };

  // Attached up front, before the first yield: every input is already in
  // flight, and nothing may be missed while the consumer is away.
  promises.forEach((promise, index) => {
    promise.then(
      (value) => deliver({ index, result: { status: "fulfilled", value } }),
      (reason: unknown) => deliver({ index, result: { status: "rejected", reason } }),
    );
  });

  while (remaining > 0) {
    if (landed.length === 0) {
      await new Promise<void>((resolve) => {
        wake = resolve;
      });
    }
    while (landed.length > 0) {
      yield landed.shift() as Landed<T>;
      remaining -= 1;
    }
  }
}
