// i2_interview_drills / ex1 - implement Promise.allSettled.
// See lessons/i2_interview_drills/README.md, "Drill 1".

export type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export function allSettledFromScratch<T>(promises: Promise<T>[]): Promise<Settled<T>[]> {
  throw new Error("ex1: allSettledFromScratch() is not implemented yet - edit this file.");
}
