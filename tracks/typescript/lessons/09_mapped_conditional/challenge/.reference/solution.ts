// 09_mapped_conditional / challenge - reference solution (author only).

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export function deepFreeze<T extends object>(value: T): DeepReadonly<T> {
  for (const nested of Object.values(value)) {
    if (typeof nested === "object" && nested !== null) {
      deepFreeze(nested as object);
    }
  }
  return Object.freeze(value) as DeepReadonly<T>;
}
