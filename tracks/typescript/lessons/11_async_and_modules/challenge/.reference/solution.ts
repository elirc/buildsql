// 11_async_and_modules / challenge - reference solution (author only).

export type TaskResult<T> = { ok: true; value: T } | { ok: false; error: string };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runTasks<T>(
  tasks: readonly (() => Promise<T>)[],
  limit: number,
): Promise<TaskResult<T>[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("runTasks: limit must be at least 1");
  }
  const results: TaskResult<T>[] = new Array(tasks.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const index = next;
      next += 1;
      try {
        results[index] = { ok: true, value: await tasks[index]() };
      } catch (error) {
        results[index] = { ok: false, error: messageOf(error) };
      }
    }
  }

  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(limit, tasks.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}
