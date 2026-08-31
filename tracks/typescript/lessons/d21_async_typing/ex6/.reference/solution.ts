// d21_async_typing / ex6 - reference solution (author only).

export function withTimeout<T>(
  task: Promise<T>,
  expire: Promise<void>,
  message: string,
): Promise<T> {
  const timeout: Promise<never> = expire.then(() => {
    throw new Error(message);
  });
  return Promise.race([task, timeout]);
}
