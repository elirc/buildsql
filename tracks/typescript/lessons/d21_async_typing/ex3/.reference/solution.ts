// d21_async_typing / ex3 - reference solution (author only).

export async function partitionSettled<T>(
  tasks: readonly Promise<T>[],
): Promise<{ fulfilled: T[]; rejected: unknown[] }> {
  const settled = await Promise.allSettled(tasks);
  const fulfilled: T[] = [];
  const rejected: unknown[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      fulfilled.push(result.value);
    } else {
      rejected.push(result.reason);
    }
  }
  return { fulfilled, rejected };
}
