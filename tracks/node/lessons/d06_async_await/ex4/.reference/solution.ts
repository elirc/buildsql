// d06_async_await / ex4 - reference solution (author only, used by `dojo verify`).

export async function withCleanup<T>(
  run: () => Promise<T>,
  cleanup: () => Promise<void> | void,
): Promise<T> {
  let result: T;

  try {
    result = await run();
  } catch (error) {
    // On the failure path the cleanup is best effort: whatever it does, the
    // caller must still be told what actually broke.
    try {
      await cleanup();
    } catch {
      // deliberately swallowed - see the original throw below
    }
    throw error;
  }

  // On the success path there is no error to protect, so a failing cleanup is
  // the most important thing that happened.
  await cleanup();
  return result;
}
