// d08_promise_combinators / ex5 - reference solution (author only, used by `dojo verify`).

export type Outcome<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown }
  | { status: "timedout" };

export function settleWithin<T>(
  promises: readonly Promise<T>[],
  ms: number,
): Promise<Outcome<T>[]> {
  return new Promise<Outcome<T>[]>((resolve) => {
    // Start with everything marked timedout and overwrite as answers arrive:
    // then the deadline handler has nothing to work out.
    const outcomes: Outcome<T>[] = promises.map(() => ({ status: "timedout" }));
    let remaining = promises.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    const deadline = setTimeout(() => resolve(outcomes), ms);

    const finish = (): void => {
      remaining -= 1;
      if (remaining > 0) return;
      clearTimeout(deadline);
      resolve(outcomes);
    };

    promises.forEach((promise, index) => {
      promise.then(
        (value) => {
          outcomes[index] = { status: "fulfilled", value };
          finish();
        },
        (reason: unknown) => {
          outcomes[index] = { status: "rejected", reason };
          finish();
        },
      );
    });
  });
}
