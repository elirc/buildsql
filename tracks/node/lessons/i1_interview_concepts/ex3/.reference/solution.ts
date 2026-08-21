// i1_interview_concepts / ex3 - reference solution (author only, used by `dojo verify`).

export type Callback<T> = (error: Error | null, value?: T) => void;

export function guardOnce<T>(callback: Callback<T>): Callback<T> {
  let called = false;
  return (error, value) => {
    if (called) return;
    called = true;
    callback(error, value);
  };
}

export function isOperational(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const candidate = error as Error & { isOperational?: boolean; code?: unknown };
  if (candidate.isOperational === true) return true;
  if (error instanceof TypeError || error instanceof RangeError ||
      error instanceof ReferenceError || error instanceof SyntaxError) {
    return false;
  }
  return typeof candidate.code === "string" && /^E[A-Z]+$/.test(candidate.code);
}
