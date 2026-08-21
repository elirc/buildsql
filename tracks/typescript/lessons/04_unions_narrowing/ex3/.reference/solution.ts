// 04_unions_narrowing / ex3 - reference solution (author only).

export type Failure = Error | { code: number; detail: string } | { timeoutMs: number };

export function explainFailure(failure: Failure): string {
  if (failure instanceof Error) {
    return `caught: ${failure.message}`;
  }
  if ("code" in failure) {
    return `http ${failure.code}: ${failure.detail}`;
  }
  return `timed out after ${failure.timeoutMs}ms`;
}
