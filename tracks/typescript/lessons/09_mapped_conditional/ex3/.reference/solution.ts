// 09_mapped_conditional / ex3 - reference solution (author only).

export type ElementOf<T> = T extends readonly (infer U)[] ? U : T;

export function flattenOnce<T>(items: readonly T[]): ElementOf<T>[] {
  const flat: ElementOf<T>[] = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      flat.push(...(item as ElementOf<T>[]));
    } else {
      flat.push(item as ElementOf<T>);
    }
  }
  return flat;
}
