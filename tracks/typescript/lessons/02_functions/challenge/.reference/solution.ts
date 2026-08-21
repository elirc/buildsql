// 02_functions / challenge - reference solution (author only).

function fail(message: string): never {
  throw new Error(message);
}

export function retry(attempts: number, action: () => string): string {
  if (attempts < 1) {
    fail("retry: attempts must be at least 1");
  }
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
