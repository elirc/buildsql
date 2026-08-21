// i3_interview_rapidfire / ex3 - a deadline with a tidy exit.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 3".

export async function withDeadline<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  throw new Error("ex3: withDeadline() is not implemented yet - edit this file.");
}
