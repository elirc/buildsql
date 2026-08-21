// 11_async_and_modules / challenge - the track capstone: a typed task runner.
// See lessons/11_async_and_modules/README.md, "Challenge".

export type TaskResult<T> = { ok: true; value: T };

export function runTasks<T>(
  tasks: readonly (() => Promise<T>)[],
  limit: number,
): Promise<TaskResult<T>[]> {
  throw new Error("challenge: runTasks() is not implemented yet - edit this file.");
}
