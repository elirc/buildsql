// i2_interview_drills / ex1 - reference solution (author only, used by `dojo verify`).

export type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export function allSettledFromScratch<T>(promises: Promise<T>[]): Promise<Settled<T>[]> {
  return Promise.all(
    promises.map((promise) =>
      promise.then<Settled<T>, Settled<T>>(
        (value) => ({ status: "fulfilled", value }),
        (reason: unknown) => ({ status: "rejected", reason }),
      ),
    ),
  );
}
