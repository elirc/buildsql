// i2_interview_drills / ex2 - the concurrency limiter, under a clock.
// See lessons/i2_interview_drills/README.md, "Drill 2".

export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  throw new Error("ex2: mapLimit() is not implemented yet - edit this file.");
}
