// 09_mapped_conditional / ex2 - reference solution (author only).

export type Getters<T> = {
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K];
};

export function makeGetters<T extends object>(source: T): Getters<T> {
  const getters: Record<string, () => unknown> = {};
  for (const key of Object.keys(source)) {
    const name = `get${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    getters[name] = () => source[key as keyof T];
  }
  return getters as Getters<T>;
}
