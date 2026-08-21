// i3_interview_rapidfire / ex3 - reference solution (author only).

export function sortByKey<T, K extends keyof T>(items: readonly T[], key: K): T[] {
  return [...items].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (left === right) {
      return 0;
    }
    return left < right ? -1 : 1;
  });
}
