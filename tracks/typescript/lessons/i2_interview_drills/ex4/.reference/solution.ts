// i2_interview_drills / ex4 - reference solution (author only).

export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  waitMs: number,
): (...args: Parameters<F>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };
}
