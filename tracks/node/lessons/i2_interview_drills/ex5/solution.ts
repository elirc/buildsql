// i2_interview_drills / ex5 - promisify and callbackify.
// See lessons/i2_interview_drills/README.md, "Drill 5".

export type Callback<T> = (error: Error | null, value?: T) => void;

/** (arg, callback) => void   becomes   (arg) => Promise<T> */
export function promisify<A, T>(
  fn: (arg: A, callback: Callback<T>) => void,
): (arg: A) => Promise<T> {
  throw new Error("ex5: promisify() is not implemented yet - edit this file.");
}

/** (arg) => Promise<T>   becomes   (arg, callback) => void */
export function callbackify<A, T>(
  fn: (arg: A) => Promise<T>,
): (arg: A, callback: Callback<T>) => void {
  throw new Error("ex5: callbackify() is not implemented yet - edit this file.");
}
