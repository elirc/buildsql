// 08_utility_types / ex4 - reference solution (author only).

export type Loader = () => Promise<{ id: string; title: string }>;

export type Loaded = Awaited<ReturnType<Loader>>;

export function once<F extends (...args: any[]) => any>(
  fn: F,
): (...args: Parameters<F>) => ReturnType<F> {
  let called = false;
  let result: ReturnType<F>;
  return (...args: Parameters<F>): ReturnType<F> => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
