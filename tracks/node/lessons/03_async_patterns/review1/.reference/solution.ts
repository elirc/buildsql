// 03_async_patterns / review1 - reference solution (author only, used by `dojo verify`).

export async function firstSuccessful<T>(tasks: (() => Promise<T>)[]): Promise<T> {
  const messages: string[] = [];
  const running = tasks.map((task, index) =>
    task().catch((error: unknown) => {
      messages[index] = error instanceof Error ? error.message : String(error);
      throw error;
    }),
  );

  try {
    return await Promise.any(running);
  } catch {
    throw new Error(`all tasks failed: ${messages.filter((m) => m !== undefined).join(", ")}`);
  }
}
