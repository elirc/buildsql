// d09_generic_functions / ex6 - reference solution (author only).

export function memoize<A, R>(fn: (arg: A) => R, keyOf: (arg: A) => string): (arg: A) => R {
  const cache = new Map<string, R>();
  return (arg: A): R => {
    const key = keyOf(arg);
    const cached = cache.get(key);
    if (cached !== undefined || cache.has(key)) {
      return cached as R;
    }
    const value = fn(arg);
    cache.set(key, value);
    return value;
  };
}
