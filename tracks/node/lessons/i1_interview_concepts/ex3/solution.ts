// i1_interview_concepts / ex3 - the two error-handling questions.
// See lessons/i1_interview_concepts/README.md, "Exercise 3".

export type Callback<T> = (error: Error | null, value?: T) => void;

/** Wraps a callback so that only the first call gets through. */
export function guardOnce<T>(callback: Callback<T>): Callback<T> {
  throw new Error("ex3: guardOnce() is not implemented yet - edit this file.");
}

/** Operational (the world misbehaved) or programmer (your code has a bug)? */
export function isOperational(error: unknown): boolean {
  throw new Error("ex3: isOperational() is not implemented yet - edit this file.");
}
