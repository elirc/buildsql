// i2_interview_drills / ex3 - "turn a callback API into a promise" (5 minutes).
// See lessons/i2_interview_drills/README.md, "Drill 3".
//
// Both halves are wanted: the TYPE that converts a callback signature into a
// promise-returning one, and the function that does it at runtime.

export type Callback<T> = (error: Error | null, value?: T) => void;

export type Promisified<T> = () => Promise<T>;

export function promisify<T>(fn: (callback: Callback<T>) => void): () => Promise<T> {
  throw new Error("ex3: promisify() is not implemented yet - edit this file.");
}
