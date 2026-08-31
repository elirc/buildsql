// d02_module_patterns / ex1 - reference solution (author only, used by `dojo verify`).

export function once<T>(factory: () => T): () => T {
  // The flag, not the value, is what records that the factory has run - a
  // factory is allowed to return undefined.
  let done = false;
  let value: T;

  return (): T => {
    if (!done) {
      // Assign only after the factory returns: a throw must leave `done`
      // false so the next caller gets a real second attempt.
      value = factory();
      done = true;
    }
    return value;
  };
}
