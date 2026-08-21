// 03_async_patterns / ex2 - reference solution (author only, used by `dojo verify`).

export interface Collected<T> {
  ok: T[];
  failed: string[];
}

export async function collectResults<T>(tasks: (() => Promise<T>)[]): Promise<Collected<T>> {
  const outcomes = await Promise.allSettled(tasks.map((task) => task()));

  const ok: T[] = [];
  const failed: string[] = [];
  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") ok.push(outcome.value);
    else failed.push(outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason));
  }
  return { ok, failed };
}
