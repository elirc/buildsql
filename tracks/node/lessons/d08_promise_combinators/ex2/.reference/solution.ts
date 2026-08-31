// d08_promise_combinators / ex2 - reference solution (author only, used by `dojo verify`).

export function raceFirst<T>(promises: readonly Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // No bookkeeping at all: attach to everything and let the promise's own
    // settle-once rule pick the winner. An empty array attaches nothing, so
    // the promise stays pending forever - which is the specified behaviour.
    for (const promise of promises) promise.then(resolve, reject);
  });
}
