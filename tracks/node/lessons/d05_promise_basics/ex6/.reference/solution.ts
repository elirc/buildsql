// d05_promise_basics / ex6 - reference solution (author only, used by `dojo verify`).

export function chainSequential<T, R>(
  items: readonly T[],
  step: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  // reduce builds the chain without ever holding two steps in flight: each
  // link's .then is what CALLS the next step, so nothing starts early.
  return items
    .reduce<Promise<void>>(
      (chain, item, index) =>
        chain.then(() =>
          step(item, index).then(
            (value) => {
              results.push(value);
            },
            (error: unknown) => {
              throw new Error(`step ${index} failed`, { cause: error });
            },
          ),
        ),
      Promise.resolve(),
    )
    .then(() => results);
}
