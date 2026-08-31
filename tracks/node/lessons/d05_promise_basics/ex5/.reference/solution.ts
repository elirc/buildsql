// d05_promise_basics / ex5 - reference solution (author only, used by `dojo verify`).

export type Snapshot<T> =
  | { state: "pending" }
  | { state: "fulfilled"; value: T }
  | { state: "rejected"; reason: unknown };

export function inspect<T>(promise: Promise<T>): Promise<Snapshot<T>> {
  // Attaching first matters: on an already settled promise these handlers are
  // queued as microtasks before the marker below, so they win the race.
  const settled: Promise<Snapshot<T>> = promise.then(
    (value) => ({ state: "fulfilled", value }) as Snapshot<T>,
    (reason: unknown) => ({ state: "rejected", reason }) as Snapshot<T>,
  );

  const marker: Promise<Snapshot<T>> = Promise.resolve().then(
    () => ({ state: "pending" }) as Snapshot<T>,
  );

  return Promise.race([settled, marker]);
}
