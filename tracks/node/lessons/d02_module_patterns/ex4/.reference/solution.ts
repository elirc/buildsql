// d02_module_patterns / ex4 - reference solution (author only, used by `dojo verify`).

export function createNamespace(
  factories: Record<string, () => unknown>,
): Record<string, unknown> {
  const namespace: Record<string, unknown> = {};

  for (const [name, factory] of Object.entries(factories)) {
    let built = false;
    let value: unknown;

    Object.defineProperty(namespace, name, {
      // enumerable so Object.keys() can describe the namespace without
      // evaluating any of it.
      enumerable: true,
      configurable: true,
      get(): unknown {
        if (!built) {
          value = factory();
          built = true;
        }
        return value;
      },
    });
  }

  return namespace;
}
