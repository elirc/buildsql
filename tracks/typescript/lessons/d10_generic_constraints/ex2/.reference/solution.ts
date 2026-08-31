// d10_generic_constraints / ex2 - reference solution (author only).

export function replaceById<T extends { id: string }>(items: readonly T[], updated: T): T[] {
  const index = items.findIndex((item) => item.id === updated.id);
  if (index === -1) {
    return [...items, updated];
  }
  return items.map((item, i) => (i === index ? updated : item));
}
